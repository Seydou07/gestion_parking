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
}
