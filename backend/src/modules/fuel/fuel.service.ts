import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuelRecordDto } from './dto/create-fuel-record.dto';
import { CreateFuelCardDto } from './dto/create-fuel-card.dto';
import { CreateFuelVoucherDto } from './dto/create-fuel-voucher.dto';
import { PaymentMethod, FuelVoucherStatus } from '@prisma/client';
import { HistoryService } from '../history/history.service';

@Injectable()
export class FuelService {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService
    ) { }

    // --- Fuel Records ---
    async createRecord(dto: CreateFuelRecordDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Process payment method
            if (dto.modePaiement === PaymentMethod.CARTE_CARBURANT && dto.carteCarburantId) {
                const card = await tx.fuelCard.findUnique({ where: { id: dto.carteCarburantId } });
                if (!card || card.solde < dto.montant) {
                    throw new BadRequestException('Solde de la carte insuffisant ou carte introuvable');
                }
                await tx.fuelCard.update({
                    where: { id: dto.carteCarburantId },
                    data: { solde: { decrement: dto.montant } },
                });
            } else if (dto.modePaiement === PaymentMethod.BON_ESSENCE && dto.bonEssenceId) {
                const voucher = await tx.fuelVoucher.findUnique({ where: { id: dto.bonEssenceId } });
                if (!voucher || voucher.statut !== FuelVoucherStatus.DISPONIBLE) {
                    throw new BadRequestException('Bon d\'essence non disponible ou introuvable');
                }
                await tx.fuelVoucher.update({
                    where: { id: dto.bonEssenceId },
                    data: { statut: FuelVoucherStatus.UTILISE },
                });
            }

            // 2. Update vehicle mileage and budget if paid by Cash
            const vehicleUpdateData: any = { 
                kilometrage: dto.kilometrage 
            };
            
            if (dto.modePaiement === PaymentMethod.ESPECES) {
                vehicleUpdateData.budgetConsomme = { increment: dto.montant };
            }

            await tx.vehicle.update({
                where: { id: dto.vehiculeId },
                data: vehicleUpdateData,
            });

            // 3. Create fuel record
            const record = await tx.fuelRecord.create({ data: dto });

            await this.historyService.log(
                'CARBURANT',
                'FINANCE',
                `Approvisionnement de ${dto.quantite}L pour le véhicule ${record.vehiculeId} (${dto.montant} FCFA via ${dto.modePaiement})`
            );

            return record;
        });
    }

    async findAllRecords() {
        return this.prisma.fuelRecord.findMany({
            include: { vehicule: true, carteCarburant: true, bonEssence: true },
            orderBy: { date: 'desc' },
        });
    }

    // --- Fuel Cards ---
    async createCard(dto: CreateFuelCardDto) {
        const qty = dto.quantite || 1;
        const litresEstimes = dto.prixLitre && dto.prixLitre > 0 
            ? Math.round((dto.soldeInitial / dto.prixLitre) * 100) / 100 
            : null;
        
        if (qty > 1) {
            return this.prisma.$transaction(async (tx) => {
                const cards: any[] = [];
                for (let i = 0; i < qty; i++) {
                    const { quantite, ...data } = dto;
                    const card = await tx.fuelCard.create({
                        data: {
                            ...data,
                            litresEstimes,
                            numero: data.numero ? `${data.numero}-${i + 1}` : `CARD-${Date.now()}-${i + 1}`
                        }
                    });
                    cards.push(card);
                }
                return cards;
            });
        }
        
        const { quantite, ...createData } = dto;
        return this.prisma.fuelCard.create({ data: { ...createData, litresEstimes } as any });
    }

    async findAllCards() {
        return this.prisma.fuelCard.findMany();
    }

    async updateCard(id: number, dto: any) {
        const card = await this.prisma.fuelCard.findUnique({ where: { id } });
        if (!card) throw new NotFoundException('Carte introuvable');
        
        return this.prisma.fuelCard.update({
            where: { id },
            data: dto,
        });
    }

    // --- Fuel Vouchers ---
    async createVoucher(dto: CreateFuelVoucherDto) {
        const qty = dto.quantite || 1;

        if (qty > 1) {
            return this.prisma.$transaction(async (tx) => {
                const vouchers: any[] = [];
                for (let i = 0; i < qty; i++) {
                    const { quantite, ...data } = dto;
                    const voucher = await tx.fuelVoucher.create({
                        data: {
                            ...data,
                            numero: data.numero ? `${data.numero}-${i + 1}` : `BON-${Math.floor(data.valeur)}-${Date.now()}-${i + 1}`
                        }
                    });
                    vouchers.push(voucher);
                }
                return vouchers;
            });
        }

        return this.prisma.fuelVoucher.create({ data: dto as any });
    }

    async findAllVouchers() {
        return this.prisma.fuelVoucher.findMany({ include: { vehicule: true } });
    }

    async rechargeCard(id: number, amount: number) {
        const card = await this.prisma.fuelCard.findUnique({ where: { id } });
        if (!card) throw new NotFoundException('Carte introuvable');
        
        const updatedCard = await this.prisma.fuelCard.update({
            where: { id },
            data: { 
                solde: { increment: amount },
                soldeInitial: { increment: amount } // Optional: depends on how soldeInitial is interpreted
            },
        });

        await this.historyService.log(
            'RECHARGE CARTE',
            'FINANCE',
            `Recharge de la carte #${updatedCard.numero} d'un montant de ${updatedCard.solde} FCFA`
        );

        return updatedCard;
    }

    async getStats() {
        const totalSpent = await this.prisma.fuelRecord.aggregate({
            _sum: { montant: true },
        });
        const totalLiters = await this.prisma.fuelRecord.aggregate({
            _sum: { quantite: true },
        });
        return {
            totalMontant: totalSpent._sum.montant || 0,
            totalQuantite: totalLiters._sum.quantite || 0,
        };
    }

    // --- Per-Vehicle Consumption Analytics ---
    async getVehicleConsumption(vehicleId: number) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) throw new NotFoundException('Véhicule introuvable');

        const records = await this.prisma.fuelRecord.findMany({
            where: { vehiculeId: vehicleId },
            orderBy: { date: 'asc' },
        });

        // Monthly breakdown
        const monthlyMap: Record<string, { litres: number; montant: number; count: number; avgPrixLitre: number; prixLitreSum: number }> = {};
        for (const r of records) {
            const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { litres: 0, montant: 0, count: 0, avgPrixLitre: 0, prixLitreSum: 0 };
            monthlyMap[key].litres += r.quantite;
            monthlyMap[key].montant += r.montant;
            monthlyMap[key].count += 1;
            if (r.prixLitre) monthlyMap[key].prixLitreSum += r.prixLitre;
        }

        const monthly = Object.entries(monthlyMap).map(([mois, data]) => ({
            mois,
            litres: Math.round(data.litres * 100) / 100,
            montant: Math.round(data.montant),
            pleins: data.count,
            prixLitreMoyen: data.prixLitreSum > 0 ? Math.round((data.prixLitreSum / data.count) * 10) / 10 : null,
        }));

        // Consumption per km (between consecutive fills)
        const fillDetails = records.map((r, i) => {
            const kmDelta = i > 0 ? r.kilometrage - records[i - 1].kilometrage : null;
            return {
                date: r.date,
                litres: r.quantite,
                montant: r.montant,
                prixLitre: r.prixLitre || (r.quantite > 0 ? Math.round((r.montant / r.quantite) * 10) / 10 : null),
                kilometrage: r.kilometrage,
                kmParcourus: kmDelta,
                litresAux100: kmDelta && kmDelta > 0 ? Math.round((r.quantite / kmDelta) * 1000) / 10 : null,
                station: r.station,
            };
        });

        const totalLitres = records.reduce((s, r) => s + r.quantite, 0);
        const totalMontant = records.reduce((s, r) => s + r.montant, 0);

        return {
            vehicule: { id: vehicle.id, immatriculation: vehicle.immatriculation, marque: vehicle.marque, modele: vehicle.modele },
            resume: {
                totalPleins: records.length,
                totalLitres: Math.round(totalLitres * 100) / 100,
                totalMontant: Math.round(totalMontant),
                prixLitreMoyen: totalLitres > 0 ? Math.round((totalMontant / totalLitres) * 10) / 10 : null,
            },
            monthly,
            details: fillDetails,
        };
    }
}
