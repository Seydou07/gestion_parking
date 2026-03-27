import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const [
            totalVehicles,
            availableVehicles,
            inMissionVehicles,
            inMaintenanceVehicles,
            totalDrivers,
            availableDrivers,
            inMissionDrivers,
            inactiveDrivers,
            activeMissions,
        ] = await Promise.all([
            this.prisma.vehicle.count(),
            this.prisma.vehicle.count({ where: { statut: 'DISPONIBLE' } }),
            this.prisma.vehicle.count({ where: { statut: 'EN_MISSION' } }),
            this.prisma.vehicle.count({ where: { statut: 'EN_MAINTENANCE' } }),
            this.prisma.driver.count(),
            this.prisma.driver.count({ where: { statut: 'DISPONIBLE' } }),
            this.prisma.driver.count({ where: { statut: 'EN_MISSION' } }),
            this.prisma.driver.count({ where: { statut: 'INACTIF' } }),
            this.prisma.mission.count({ where: { statut: 'EN_COURS' } }),
        ]);

        // Fuel expenses last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const fuelExpense = await this.prisma.fuelRecord.aggregate({
            where: { date: { gte: thirtyDaysAgo } },
            _sum: { montant: true },
        });

        const maintenanceExpense = await this.prisma.maintenance.aggregate({
            where: { dateDebut: { gte: thirtyDaysAgo } },
            _sum: { montant: true },
        });

        return {
            vehicles: {
                total: totalVehicles,
                available: availableVehicles,
                inMission: inMissionVehicles,
                inMaintenance: inMaintenanceVehicles,
            },
            drivers: {
                total: totalDrivers,
                available: availableDrivers,
                inMission: inMissionDrivers,
                inactive: inactiveDrivers,
            },
            missions: {
                active: activeMissions,
            },
            expenses: {
                fuel30d: fuelExpense._sum.montant || 0,
                maintenance30d: maintenanceExpense._sum.montant || 0,
                total30d: (fuelExpense._sum.montant || 0) + (maintenanceExpense._sum.montant || 0),
            },
        };
    }

    async getMonthlyExpenses(year: number) {
        const months = [
            'Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin',
            'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        const results = await Promise.all(months.map(async (_, index) => {
            const startDate = new Date(year, index, 1);
            const endDate = new Date(year, index + 1, 0, 23, 59, 59);

            const fuel = await this.prisma.fuelRecord.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { montant: true },
            });

            const maintenance = await this.prisma.maintenance.aggregate({
                where: { dateDebut: { gte: startDate, lte: endDate } },
                _sum: { montant: true },
            });

            return {
                month: months[index],
                fuel: fuel._sum.montant || 0,
                maintenance: maintenance._sum.montant || 0,
                total: (fuel._sum.montant || 0) + (maintenance._sum.montant || 0)
            };
        }));

        return results;
    }

    async getVehicleAnalytics(vehicleId: number, year: number = new Date().getFullYear()) {
        const months = [
            'Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin',
            'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: { 
                immatriculation: true, 
                budgetAlloue: true, 
                budgetConsomme: true 
            }
        });

        if (!vehicle) throw new Error('Véhicule non trouvé');

        const monthlyStats = await Promise.all(months.map(async (_, index) => {
            const startDate = new Date(year, index, 1);
            const endDate = new Date(year, index + 1, 0, 23, 59, 59);

            const fuelRecordStats = await this.prisma.fuelRecord.aggregate({
                where: { 
                    vehiculeId: vehicleId,
                    date: { gte: startDate, lte: endDate } 
                },
                _sum: { montant: true, quantite: true },
            });

            // Get fuel from missions (vouchers and cards recorded at check-in)
            const missionFuelStats = await this.prisma.mission.aggregate({
                where: {
                    vehiculeId: vehicleId,
                    dateDepart: { gte: startDate, lte: endDate },
                    statut: 'TERMINEE'
                },
                _sum: { montantCarburantUtilise: true }
            });

            const totalFuelCost = (fuelRecordStats._sum.montant || 0) + (missionFuelStats._sum.montantCarburantUtilise || 0);
            
            // Estimate liters for missions if not recorded (fallback price 750)
            const estimatedMissionLiters = (missionFuelStats._sum.montantCarburantUtilise || 0) / 750;
            const totalLiters = (fuelRecordStats._sum.quantite || 0) + estimatedMissionLiters;

            // Get total maintenance costs
            const maintenance = await this.prisma.maintenance.aggregate({
                where: { 
                    vehiculeId: vehicleId,
                    dateDebut: { gte: startDate, lte: endDate },
                    statut: 'TERMINEE'
                },
                _sum: { montant: true },
                _count: { id: true }
            });

            // Get maintenance costs specifically from budget
            const maintenanceMainDoeuvreBudget = await this.prisma.maintenance.aggregate({
                where: {
                    vehiculeId: vehicleId,
                    dateDebut: { gte: startDate, lte: endDate },
                    statut: 'TERMINEE',
                    sourceMainDoeuvre: 'VEHICLE_BUDGET'
                },
                _sum: { mainDoeuvre: true }
            });

            const maintenanceItemsBudget = await this.prisma.maintenanceItem.aggregate({
                where: {
                    maintenance: {
                        vehiculeId: vehicleId,
                        dateDebut: { gte: startDate, lte: endDate },
                        statut: 'TERMINEE'
                    },
                    sourcePaiement: 'VEHICLE_BUDGET'
                },
                _sum: { total: true }
            });

            const budgetSpent = (maintenanceMainDoeuvreBudget._sum.mainDoeuvre || 0) + (maintenanceItemsBudget._sum.total || 0);
            const totalMaintenance = maintenance._sum.montant || 0;

            return {
                month: months[index],
                fuel: totalFuelCost,
                liters: totalLiters,
                maintenance: totalMaintenance,
                maintenanceBudget: budgetSpent,
                maintenanceCard: totalMaintenance - budgetSpent,
                maintenanceCount: maintenance._count.id || 0,
                total: totalFuelCost + totalMaintenance
            };
        }));

        const budgetAlloue = vehicle.budgetAlloue || 0;
        const budgetConsomme = vehicle.budgetConsomme || 0;

        return {
            vehicle: vehicle.immatriculation,
            budget: {
                initial: budgetAlloue,
                consomme: budgetConsomme,
                restant: budgetAlloue - budgetConsomme,
                percentage: budgetAlloue > 0 ? (budgetConsomme / budgetAlloue) * 100 : 0
            },
            monthlyStats
        };
    }
}
