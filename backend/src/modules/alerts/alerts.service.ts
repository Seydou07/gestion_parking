import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertSeverity, AlertModule } from '@prisma/client';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.alert.findMany({
            include: { vehicule: true },
            orderBy: { dateCreation: 'desc' },
        });
    }

    async findUnread() {
        return this.prisma.alert.findMany({
            where: { lue: false },
            include: { vehicule: true },
            orderBy: { dateCreation: 'desc' },
        });
    }

    async markAsRead(id: number) {
        return this.prisma.alert.update({
            where: { id },
            data: { lue: true },
        });
    }

    // Engine: Run this periodically or on specific events
    async checkAlerts() {
        // 1. Check insurance expirations
        const soon = new Date();
        soon.setDate(soon.getDate() + 30); // 30 days before

        const expiringInsurance = await this.prisma.vehicle.findMany({
            where: { assuranceExpiration: { lte: soon } },
        });

        for (const v of expiringInsurance) {
            await this.createAlert({
                type: 'EXPIRATION_ASSURANCE',
                message: `L'assurance du véhicule ${v.immatriculation} expire le ${v.assuranceExpiration?.toLocaleDateString()}`,
                module: AlertModule.VEHICULE,
                severity: AlertSeverity.CRITICAL,
                vehiculeId: v.id,
            });
        }

        // 2. Check technical visits
        const expiringTV = await this.prisma.vehicle.findMany({
            where: { prochainControle: { lte: soon } },
        });

        for (const v of expiringTV) {
            await this.createAlert({
                type: 'VISITE_TECHNIQUE',
                message: `La visite technique du véhicule ${v.immatriculation} doit être faite avant le ${v.prochainControle?.toLocaleDateString()}`,
                module: AlertModule.VEHICULE,
                severity: AlertSeverity.WARNING,
                vehiculeId: v.id,
            });
        }

        // 3. Check Budgets
        const vehiclesWithHighBudget = await this.prisma.vehicle.findMany({
            where: {
                budgetAlloue: { gt: 0 }
            }
        });

        for (const v of vehiclesWithHighBudget) {
            const consumed = v.budgetConsomme || 0;
            const allocated = v.budgetAlloue || 0;
            if (consumed >= allocated * 0.9) {
                await this.createAlert({
                    type: 'BUDGET_ALERTE',
                    message: `Le budget alloué au véhicule ${v.immatriculation} est consommé à plus de 90%`,
                    module: AlertModule.BUDGET,
                    severity: AlertSeverity.WARNING,
                    vehiculeId: v.id,
                });
            }
        }
    }

    private async createAlert(data: any) {
        // Avoid duplicates
        const exists = await this.prisma.alert.findFirst({
            where: { type: data.type, vehiculeId: data.vehiculeId, lue: false },
        });
        if (!exists) {
            await this.prisma.alert.create({ data });
        }
    }
}
