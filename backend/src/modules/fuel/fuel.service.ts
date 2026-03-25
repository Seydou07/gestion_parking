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
        return this.prisma.fuelCard.create({ data: dto });
    }

    async findAllCards() {
        return this.prisma.fuelCard.findMany();
    }

    // --- Fuel Vouchers ---
    async createVoucher(dto: CreateFuelVoucherDto) {
        return this.prisma.fuelVoucher.create({ data: dto });
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
}
