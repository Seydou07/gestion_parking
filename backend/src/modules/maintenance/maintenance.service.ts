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
        return this.prisma.$transaction(async (tx) => {
            const maintenance = await tx.maintenance.create({ data: dto });

            // If it's a breakdown (PANNE), block the vehicle
            if (dto.type === MaintenanceType.PANNE) {
                await tx.vehicle.update({
                    where: { id: dto.vehiculeId },
                    data: { statut: VehicleStatus.EN_MAINTENANCE },
                });
            }

            await this.historyService.log(
                'DEMANDE MAINTENANCE',
                'MAINTENANCE',
                `Nouvelle demande de ${maintenance.type.toLowerCase()} pour le véhicule ${maintenance.vehiculeId}`
            );

            return maintenance;
        });
    }

    async findAll() {
        return this.prisma.maintenance.findMany({
            include: { vehicule: true },
            orderBy: { dateDebut: 'desc' },
        });
    }

    async update(id: number, dto: UpdateMaintenanceDto) {
        return this.prisma.$transaction(async (tx) => {
            const maintenance = await tx.maintenance.update({
                where: { id },
                data: dto,
            });

            // If maintenance is finished, release the vehicle and handle payment
            if (dto.statut === MaintenanceStatus.TERMINEE) {
                const updateData: any = { statut: VehicleStatus.DISPONIBLE };
                const montant = maintenance.montant || 0;

                if (maintenance.modePaiement === PaymentMethod.CARTE_CARBURANT && maintenance.carteCarburantId) {
                    await tx.fuelCard.update({
                        where: { id: maintenance.carteCarburantId },
                        data: { solde: { decrement: montant } },
                    });
                } else if (maintenance.modePaiement === PaymentMethod.BON_ESSENCE && maintenance.bonEssenceId) {
                    await tx.fuelVoucher.update({
                        where: { id: maintenance.bonEssenceId },
                        data: { statut: FuelVoucherStatus.UTILISE },
                    });
                } else {
                    // Paid by Cash or Bank -> deduct from Vehicle Budget
                    updateData.budgetConsomme = { increment: montant };
                }

                await tx.vehicle.update({
                    where: { id: maintenance.vehiculeId },
                    data: updateData,
                });

                await this.historyService.log(
                    'MAINTENANCE TERMINÉE',
                    'MAINTENANCE',
                    `Intervention #${maintenance.id} terminée (${maintenance.montant || 0} FCFA)`
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
