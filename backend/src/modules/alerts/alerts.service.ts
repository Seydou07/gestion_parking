import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertSeverity, AlertModule } from '@prisma/client';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        await this.checkAlerts();
        return this.prisma.alert.findMany({
            include: { vehicule: true },
            orderBy: { dateCreation: 'desc' },
        });
    }

    async findUnread() {
        await this.checkAlerts();
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

    // Engine: Run this dynamically or periodically to generate alerts based on system settings
    async checkAlerts() {
        // Fetch global settings
        const settings = await this.prisma.systemSettings.findUnique({ where: { id: 1 } });
        const relanceAssurance = settings?.relanceAssuranceJours ?? 30;
        const relanceVisite = settings?.relanceVisiteJours ?? 30;
        const alerteCarburant = settings?.alerteStockCarburant ?? 10;
        const seuilVidangeGlobal = settings?.seuilVidangeKm ?? 5000;

        // 1. Check insurance expirations
        const soonInsurance = new Date();
        soonInsurance.setDate(soonInsurance.getDate() + relanceAssurance);

        const expiringInsurance = await this.prisma.vehicle.findMany({
            where: { assuranceExpiration: { lte: soonInsurance } },
        });

        for (const v of expiringInsurance) {
            await this.createAlert({
                type: 'EXPIRATION_ASSURANCE',
                message: `L'assurance du véhicule ${v.immatriculation} expire le ${v.assuranceExpiration?.toLocaleDateString('fr-FR')}`,
                module: AlertModule.VEHICULE,
                severity: AlertSeverity.CRITICAL,
                vehiculeId: v.id,
            });
        }

        // 2. Check technical visits
        const soonTV = new Date();
        soonTV.setDate(soonTV.getDate() + relanceVisite);

        const expiringTV = await this.prisma.vehicle.findMany({
            where: { prochainControle: { lte: soonTV } },
        });

        for (const v of expiringTV) {
            await this.createAlert({
                type: 'VISITE_TECHNIQUE',
                message: `La visite technique du véhicule ${v.immatriculation} doit être faite avant le ${v.prochainControle?.toLocaleDateString('fr-FR')}`,
                module: AlertModule.VEHICULE,
                severity: AlertSeverity.WARNING,
                vehiculeId: v.id,
            });
        }

        // 3. Check Budgets (warning at 90%)
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

        // 4. Check Oil Changes (Vidange)
        const vehicles = await this.prisma.vehicle.findMany();
        for (const v of vehicles) {
            const currentKm = v.kilometrage || 0;
            const lastVidangeKm = v.derniereVidangeKilometrage || 0;
            const kmSinceLastVidange = currentKm - lastVidangeKm;
            const threshold = v.frequenceVidange || seuilVidangeGlobal;

            if (kmSinceLastVidange >= threshold) {
                await this.createAlert({
                    type: 'VIDANGE_ALERTE',
                    message: `La vidange du véhicule ${v.immatriculation} est requise (Dernière vidange à ${lastVidangeKm} km, Kilométrage actuel : ${currentKm} km, Seuil : ${threshold} km)`,
                    module: AlertModule.MAINTENANCE,
                    severity: AlertSeverity.WARNING,
                    vehiculeId: v.id,
                });
            }
        }

        // 5. Check Fuel Cards balance based on setting percentage
        const activeCards = await this.prisma.fuelCard.findMany({
            where: { statut: 'ACTIVE' }
        });
        for (const card of activeCards) {
            const initial = card.soldeInitial || 0;
            const current = card.solde || 0;
            if (initial > 0) {
                const percentLeft = (current / initial) * 100;
                if (percentLeft <= alerteCarburant) {
                    await this.createAlert({
                        type: 'CARBURANT_ALERTE',
                        message: `Le solde de la carte carburant ${card.numero} est bas (${current} FCFA, soit ${percentLeft.toFixed(1)}% du solde initial, Seuil : ${alerteCarburant}%)`,
                        module: AlertModule.CARBURANT,
                        severity: AlertSeverity.WARNING,
                    });
                }
            }
        }
    }

    private async createAlert(data: any) {
        // Avoid duplicates
        const exists = await this.prisma.alert.findFirst({
            where: { 
                type: data.type, 
                vehiculeId: data.vehiculeId || null, 
                lue: false 
            },
        });
        if (!exists) {
            await this.prisma.alert.create({ data });
        }
    }
}
