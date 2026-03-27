import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceType, VehicleStatus, MaintenanceStatus, PaymentMethod, FuelVoucherStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService
    ) { }

    async create(dto: CreateMaintenanceDto) {
        const { items, ...maintenanceData } = dto;
        return this.prisma.$transaction(async (tx) => {
            const maintenance = await tx.maintenance.create({
                data: {
                    vehiculeId: maintenanceData.vehiculeId,
                    type: maintenanceData.type,
                    description: maintenanceData.description,
                    dateDebut: new Date(maintenanceData.dateDebut).toISOString(),
                    dateFin: maintenanceData.dateFin ? new Date(maintenanceData.dateFin).toISOString() : undefined,
                    montant: maintenanceData.montant,
                    statut: maintenanceData.statut,
                    garage: maintenanceData.garage,
                    notes: maintenanceData.notes,
                    modePaiement: maintenanceData.modePaiement,
                    carteCarburantId: maintenanceData.carteCarburantId,
                    bonEssenceId: maintenanceData.bonEssenceId,
                    mainDoeuvre: maintenanceData.mainDoeuvre,
                    sourceMainDoeuvre: maintenanceData.sourceMainDoeuvre,
                    items: items ? {
                        create: items.map(item => ({
                            nom: item.nom,
                            reference: item.reference,
                            quantite: item.quantite,
                            prixUnitaire: item.prixUnitaire,
                            total: item.total,
                            sourcePaiement: item.sourcePaiement
                        }))
                    } : undefined
                }
            });

            // Block the vehicle if it's planned (EN_ATTENTE), actively in the garage (EN_COURS), or is a breakdown (PANNE)
            const shouldBlock = dto.type === MaintenanceType.PANNE || 
                                maintenanceData.statut === MaintenanceStatus.EN_COURS ||
                                maintenanceData.statut === MaintenanceStatus.EN_ATTENTE ||
                                !maintenanceData.statut;
            if (shouldBlock) {
                await tx.vehicle.update({
                    where: { id: dto.vehiculeId },
                    data: { statut: VehicleStatus.EN_MAINTENANCE },
                });
            }

            await this.historyService.log(
                'DEMANDE MAINTENANCE',
                'MAINTENANCE',
                `Nouvelle demande de ${maintenance.type.toLowerCase()} pour le véhicule ${maintenance.vehiculeId}`,
                undefined,
                maintenance.id,
                'MAINTENANCE'
            );

            return maintenance;
        });
    }

    async findAll() {
        return this.prisma.maintenance.findMany({
            include: { vehicule: true, items: true },
            orderBy: { dateDebut: 'desc' },
        });
    }

    async findOne(id: number) {
        const maintenance = await this.prisma.maintenance.findUnique({
            where: { id },
            include: { vehicule: true, items: true },
        });
        if (!maintenance) throw new NotFoundException(`Maintenance #${id} not found`);
        return maintenance;
    }

    async update(id: number, dto: UpdateMaintenanceDto) {
        const { items, ...maintenanceData } = dto;
        
        return this.prisma.$transaction(async (tx) => {
            const maintenance = await tx.maintenance.update({
                where: { id },
                include: { items: true },
                data: {
                    vehiculeId: maintenanceData.vehiculeId,
                    type: maintenanceData.type,
                    description: maintenanceData.description,
                    dateDebut: maintenanceData.dateDebut ? new Date(maintenanceData.dateDebut).toISOString() : undefined,
                    dateFin: maintenanceData.dateFin ? new Date(maintenanceData.dateFin).toISOString() : undefined,
                    montant: maintenanceData.montant,
                    statut: maintenanceData.statut,
                    garage: maintenanceData.garage,
                    notes: maintenanceData.notes,
                    modePaiement: maintenanceData.modePaiement,
                    carteCarburantId: maintenanceData.carteCarburantId,
                    bonEssenceId: maintenanceData.bonEssenceId,
                    mainDoeuvre: maintenanceData.mainDoeuvre,
                    sourceMainDoeuvre: maintenanceData.sourceMainDoeuvre,
                    items: items ? {
                        deleteMany: {},
                        create: items.map(item => ({
                            nom: item.nom,
                            reference: item.reference,
                            quantite: item.quantite,
                            prixUnitaire: item.prixUnitaire,
                            total: item.total,
                            sourcePaiement: item.sourcePaiement
                        }))
                    } : undefined
                },
            });

            // If maintenance is planned or actively in progress, block the vehicle
            if (dto.statut === MaintenanceStatus.EN_COURS || dto.statut === MaintenanceStatus.EN_ATTENTE) {
                await tx.vehicle.update({
                    where: { id: maintenance.vehiculeId },
                    data: { statut: VehicleStatus.EN_MAINTENANCE },
                });
            }

            // If maintenance is canceled, release the vehicle
            if (dto.statut === MaintenanceStatus.ANNULEE) {
                await tx.vehicle.update({
                    where: { id: maintenance.vehiculeId },
                    data: { statut: VehicleStatus.DISPONIBLE },
                });
            }

            // If maintenance is finished, release the vehicle and handle split payment
            if (dto.statut === MaintenanceStatus.TERMINEE) {
                const vehicle = await tx.vehicle.findUnique({ where: { id: maintenance.vehiculeId } });
                if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

                let totalToDeductFromCard = 0;
                let totalToDeductFromBudget = 0;

                // Handle items
                for (const item of maintenance.items) {
                    if (item.sourcePaiement === 'FUEL_CARD') {
                        totalToDeductFromCard += item.total;
                    } else {
                        totalToDeductFromBudget += item.total;
                    }
                }

                // Handle labor
                if (maintenance.sourceMainDoeuvre === 'FUEL_CARD') {
                    totalToDeductFromCard += maintenance.mainDoeuvre || 0;
                } else {
                    totalToDeductFromBudget += maintenance.mainDoeuvre || 0;
                }

                // Apply Fuel Card deduction if needed
                if (totalToDeductFromCard > 0 && maintenance.carteCarburantId) {
                    await tx.fuelCard.update({
                        where: { id: maintenance.carteCarburantId },
                        data: { solde: { decrement: totalToDeductFromCard } },
                    });
                }

                // Apply Vehicle Budget deduction (increment consumed budget)
                const updateData: any = { 
                    statut: VehicleStatus.DISPONIBLE,
                    budgetConsomme: { increment: totalToDeductFromBudget }
                };

                await tx.vehicle.update({
                    where: { id: maintenance.vehiculeId },
                    data: updateData,
                });

                await this.historyService.log(
                    'MAINTENANCE TERMINÉE',
                    'MAINTENANCE',
                    `Intervention #${maintenance.id} terminée (Budget: ${totalToDeductFromBudget} FCFA, Carte: ${totalToDeductFromCard} FCFA)`,
                    undefined,
                    maintenance.id,
                    'MAINTENANCE'
                );
            }

            return maintenance;
        });
    }

    async getUpcoming() {
        // This could return upcoming oil changes, technical visits, etc.
        // Basic implementation for now
        return this.prisma.maintenance.findMany({
            where: { statut: MaintenanceStatus.EN_ATTENTE },
            include: { vehicule: true },
        });
    }
}
