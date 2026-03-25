import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { BudgetService } from '../budget/budget.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService,
        private budgetService: BudgetService
    ) { }

    async create(createVehicleDto: CreateVehicleDto) {
        const { budgetInitial, ...rest } = createVehicleDto;
        
        // Convert date strings to Date objects for Prisma
        const vehicleData: any = { ...rest };
        
        // Robust date conversion handling empty strings
        const convertDate = (val: any) => {
            if (!val || val === '') return null;
            const date = new Date(val);
            return isNaN(date.getTime()) ? null : date;
        };

        if ('dateAcquisition' in vehicleData) vehicleData.dateAcquisition = convertDate(vehicleData.dateAcquisition);
        if ('assuranceExpiration' in vehicleData) vehicleData.assuranceExpiration = convertDate(vehicleData.assuranceExpiration);
        if ('prochainControle' in vehicleData) vehicleData.prochainControle = convertDate(vehicleData.prochainControle);
        
        const vehicle = await this.prisma.vehicle.create({
            data: vehicleData,
        });

        if (budgetInitial && budgetInitial > 0) {
            try {
                await this.budgetService.allocate({
                    vehiculeId: vehicle.id,
                    montant: budgetInitial,
                    annee: new Date().getFullYear(),
                    type: 'ANNUEL'
                });
            } catch (error) {
                console.error("Failed to allocate initial budget:", error);
                // We keep the vehicle but log the error
            }
        }

        await this.historyService.log(
            'CRÉATION',
            'VÉHICULE',
            `Ajout du véhicule ${vehicle.immatriculation} (${vehicle.marque} ${vehicle.modele})${budgetInitial ? ` avec un budget de ${budgetInitial} FCFA` : ''}`
        );
        return vehicle;
    }

    async findAll() {
        return this.prisma.vehicle.findMany({
            include: {
                _count: {
                    select: {
                        missions: true,
                        fuelRecords: true,
                        maintenances: true,
                    },
                },
            },
        });
    }

    async findOne(id: number) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                missions: { take: 5, orderBy: { dateDepart: 'desc' } },
                fuelRecords: { take: 5, orderBy: { date: 'desc' } },
                maintenances: { take: 5, orderBy: { dateDebut: 'desc' } },
            },
        });
        if (!vehicle) throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        return vehicle;
    }

    async update(id: number, updateVehicleDto: UpdateVehicleDto) {
        const { budgetInitial, ...rest } = updateVehicleDto as any;
        
        // 1. Check for budget changes
        if (budgetInitial !== undefined) {
            const currentVehicle = await this.prisma.vehicle.findUnique({ where: { id } });
            if (currentVehicle && currentVehicle.budgetAlloue !== budgetInitial) {
                const difference = budgetInitial - (currentVehicle.budgetAlloue || 0);
                await this.budgetService.allocate({
                    vehiculeId: id,
                    montant: difference,
                    annee: new Date().getFullYear(),
                    type: 'ANNUEL',
                    commentaire: `Ajustement automatique lors de la modification du véhicule (Ancien: ${currentVehicle.budgetAlloue}, Nouveau: ${budgetInitial})`
                });
            }
        }

        const updateData: any = { ...rest };
        // IMPORTANT: Prevent overwriting budgetAlloue if it was sent in the DTO
        // budgetAlloue should only be updated via the budgetService.allocate logic above
        delete updateData.budgetAlloue;
        
        // Robust date conversion handling empty strings
        const convertDate = (val: any) => {
            if (!val || val === '') return null;
            const date = new Date(val);
            return isNaN(date.getTime()) ? null : date;
        };

        if ('dateAcquisition' in updateData) updateData.dateAcquisition = convertDate(updateData.dateAcquisition);
        if ('assuranceExpiration' in updateData) updateData.assuranceExpiration = convertDate(updateData.assuranceExpiration);
        if ('prochainControle' in updateData) updateData.prochainControle = convertDate(updateData.prochainControle);
        
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: updateData,
        });
        await this.historyService.log(
            'MODIFICATION',
            'VÉHICULE',
            `Mise à jour du véhicule ${vehicle.immatriculation}`
        );
        return vehicle;
    }

    async remove(id: number) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);

        // Refund allocated budget to global pool
        if (vehicle.budgetAlloue && vehicle.budgetAlloue > 0) {
            try {
                await this.budgetService.allocate({
                    vehiculeId: id,
                    montant: -vehicle.budgetAlloue,
                    annee: new Date().getFullYear(),
                    type: 'ANNUEL',
                    commentaire: `Retour au budget global suite à la suppression du véhicule ${vehicle.immatriculation}`
                });
            } catch (error) {
                console.error("Failed to refund budget during vehicle deletion:", error);
            }
        }

        const deletedVehicle = await this.prisma.vehicle.delete({
            where: { id },
        });

        await this.historyService.log(
            'SUPPRESSION',
            'VÉHICULE',
            `Suppression du véhicule ${deletedVehicle.immatriculation}`
        );
        return deletedVehicle;
    }

    async getStats() {
        const total = await this.prisma.vehicle.count();
        const active = await this.prisma.vehicle.count({ where: { statut: 'EN_MISSION' } });
        const maintenance = await this.prisma.vehicle.count({ where: { statut: 'EN_MAINTENANCE' } });
        const available = await this.prisma.vehicle.count({ where: { statut: 'DISPONIBLE' } });

        return { total, active, maintenance, available };
    }
}
