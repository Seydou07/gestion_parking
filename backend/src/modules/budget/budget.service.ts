import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AllocateBudgetDto } from './dto/allocate-budget.dto';
import { SupplyGlobalBudgetDto } from './dto/supply-global-budget.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private historyService: HistoryService
  ) {}

  async allocate(dto: AllocateBudgetDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehiculeId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${dto.vehiculeId} non trouvé`);
    }

    // --- Validation du Seuil Global ---
    const settings = await this.prisma.systemSettings.findFirst();
    if (settings && settings.budgetGlobalVehicules >= 0) {
        // Validation simple : le montant demandé (positif ou négatif) doit être disponible dans le pool restants
        if (dto.montant > settings.budgetGlobalVehicules) {
            throw new BadRequestException(`Budget global d'entretien insuffisant. Disponible en caisse: ${settings.budgetGlobalVehicules} FCFA`);
        }
    }

    // Create allocation trace
    const allocation = await this.prisma.budgetAllocation.create({
      data: {
        vehiculeId: dto.vehiculeId,
        montant: dto.montant,
        annee: dto.annee,
        commentaire: dto.commentaire,
        type: dto.type,
      },
    });

    // Update vehicle summary fields
    await this.prisma.vehicle.update({
      where: { id: dto.vehiculeId },
      data: {
        budgetAlloue: {
          increment: dto.montant,
        },
      },
    });

    // --- TRACKING GLOBAL ---
    // Subtract from central pool
    if (settings) {
        await this.prisma.systemSettings.update({
            where: { id: 1 },
            data: {
                budgetGlobalVehicules: {
                    decrement: dto.montant
                }
            }
        });

        // Trace this exit in GlobalBudgetActivity for total traceability
        await this.prisma.globalBudgetActivity.create({
            data: {
                field: 'MAINTENANCE',
                amount: dto.montant,
                type: 'ALLOCATION_VEHICULE',
                description: dto.commentaire || `Allocation au véhicule ${vehicle.immatriculation}`
            }
        });
    }

    // Log activity
    await this.historyService.log(
      'ALLOCATION',
      'FINANCE',
      `Allocation de ${dto.montant} FCFA au véhicule ${vehicle.immatriculation} (${dto.type})`
    );

    return allocation;
  }

  async supplyGlobalBudget(dto: SupplyGlobalBudgetDto) {
    const fieldMap = {
      'MAINTENANCE': 'budgetGlobalVehicules',
      'FUEL_CARD': 'budgetGlobalCartes',
      'FUEL_BON': 'budgetGlobalBons'
    };

    const prismaField = fieldMap[dto.field];

    await this.prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        [prismaField]: {
          increment: dto.amount
        }
      }
    });

    const fieldLabels = {
      'MAINTENANCE': 'Maintenance & Réparations',
      'FUEL_CARD': 'Cartes Carburant',
      'FUEL_BON': 'Bons d\'Essence'
    };

    const result = await this.prisma.globalBudgetActivity.create({
      data: {
        field: dto.field,
        amount: dto.amount,
        description: dto.description || `Approvisionnement du budget ${fieldLabels[dto.field]}`,
        type: 'REPLENISHMENT'
      }
    });

    await this.historyService.log(
      'REPLENISHMENT',
      'FINANCE',
      `Réapprovisionnement de ${dto.amount} FCFA pour ${fieldLabels[dto.field]}`
    );

    return result;
  }

  async initializeGlobalBudget(dto: SupplyGlobalBudgetDto) {
    const fieldMap = {
      'MAINTENANCE': 'budgetGlobalVehicules',
      'FUEL_CARD': 'budgetGlobalCartes',
      'FUEL_BON': 'budgetGlobalBons'
    };

    const prismaField = fieldMap[dto.field];

    await this.prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        [prismaField]: dto.amount
      }
    });

    const fieldLabels = {
      'MAINTENANCE': 'Maintenance & Réparations',
      'FUEL_CARD': 'Cartes Carburant',
      'FUEL_BON': 'Bons d\'Essence'
    };

    const result = await this.prisma.globalBudgetActivity.create({
      data: {
        field: dto.field,
        amount: dto.amount,
        description: dto.description || `Configuration initiale du budget annuel ${fieldLabels[dto.field]}`,
        type: 'INITIAL_DEFINITION'
      }
    });

    await this.historyService.log(
      'INITIAL_CONFIG',
      'FINANCE',
      `Configuration initiale de ${dto.amount} FCFA pour ${fieldLabels[dto.field]}`
    );

    return result;
  }

  async getGlobalHistory() {
    return this.prisma.globalBudgetActivity.findMany({
      orderBy: { date: 'desc' }
    });
  }

  async getBudgetSummary() {
    const settings = await this.prisma.systemSettings.findFirst();
    const currentYear = new Date().getFullYear();

    // 1. Fuel Cards
    const cards = await this.prisma.fuelCard.findMany({
      orderBy: { numero: 'asc' }
    });
    const totalCardsBalance = cards.reduce((sum, c) => sum + (c.solde || 0), 0);

    // 2. Fuel Vouchers
    const vouchers = await this.prisma.fuelVoucher.findMany({
        where: { statut: 'DISPONIBLE' }
    });
    const totalVouchersValue = vouchers.reduce((sum, v) => sum + (v.valeur || 0), 0);
    
    // Breakdown by station and denomination
    const stationBreakdown: Record<string, { count: number, total: number, denominations: any[] }> = {};
    
    vouchers.forEach(v => {
      const station = v.station || 'Non spécifiée';
      if (!stationBreakdown[station]) {
        stationBreakdown[station] = { count: 0, total: 0, denominations: [] };
      }
      stationBreakdown[station].count++;
      stationBreakdown[station].total += v.valeur;
      
      let denomEntry = stationBreakdown[station].denominations.find(d => d.value === v.valeur);
      if (!denomEntry) {
        denomEntry = { value: v.valeur, count: 0 };
        stationBreakdown[station].denominations.push(denomEntry);
      }
      denomEntry.count++;
    });

    // Global Denomination Breakdown
    const globalDenominations: any[] = [];
    vouchers.forEach(v => {
        let entry = globalDenominations.find(d => d.value === v.valeur);
        if (!entry) {
            entry = { value: v.valeur, count: 0 };
            globalDenominations.push(entry);
        }
        entry.count++;
    });

    // 3. Vehicle Budgets & Maintenance
    const vehicles = await this.prisma.vehicle.findMany();

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const [maintenances, fuelRecords] = await Promise.all([
        this.prisma.maintenance.findMany({
            where: {
                dateDebut: { gte: startDate, lte: endDate },
                statut: 'TERMINEE'
            }
        }),
        this.prisma.fuelRecord.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            }
        })
    ]);

    const vehicleStats = vehicles.map(v => {
        const vMaintenances = maintenances.filter(m => m.vehiculeId === v.id);
        const vFuelRecords = fuelRecords.filter(fr => fr.vehiculeId === v.id);
        
        const budgetConsumed = vMaintenances.reduce((sum, m) => sum + (m.montant || 0), 0);
        const fuelSpent = vFuelRecords.reduce((sum, fr) => sum + fr.montant, 0);
        
        return {
            id: v.id,
            immatriculation: v.immatriculation,
            marque: v.marque,
            modele: v.modele,
            budgetAlloue: v.budgetAlloue || 0,
            budgetConsomme: budgetConsumed,
            fuelSpent,
            totalExpenses: budgetConsumed + fuelSpent,
            kilometrage: v.kilometrage,
            costPerKm: v.kilometrage > 0 ? (budgetConsumed + fuelSpent) / v.kilometrage : 0
        };
    });

    const totalMaintenanceAllocated = vehicles.reduce((sum, v) => sum + (v.budgetAlloue || 0), 0);

    // Initial Envelope (Search in history)
    const initialActivity = await this.prisma.globalBudgetActivity.findFirst({
        where: {
            field: 'MAINTENANCE',
            type: 'INITIAL_DEFINITION',
            date: { gte: startDate, lte: endDate }
        }
    });

    // 4. Global Activity
    const activities = await this.prisma.globalBudgetActivity.findMany({
      orderBy: { date: 'desc' },
      take: 15
    });

    return {
      settings,
      fuelCards: {
        totalBalance: totalCardsBalance,
        count: cards.length,
        cards
      },
      fuelVouchers: {
        totalValue: totalVouchersValue,
        count: vouchers.length,
        denominations: globalDenominations.sort((a, b) => b.value - a.value),
        breakdownByStation: Object.entries(stationBreakdown).map(([name, data]) => ({
            name,
            ...data,
            denominations: data.denominations.sort((a,b) => b.value - a.value)
        }))
      },
      maintenance: {
        initialEnvelope: initialActivity?.amount || (settings?.budgetGlobalVehicules || 0) + totalMaintenanceAllocated,
        currentPool: settings?.budgetGlobalVehicules || 0,
        totalAllocatedToVehicles: totalMaintenanceAllocated,
      },
      vehicleStats: vehicleStats.sort((a, b) => b.totalExpenses - a.totalExpenses),
      recentActivities: activities
    };
  }

  async getVehicleBudget(vehicleId: number, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const allocations = await this.prisma.budgetAllocation.findMany({
      where: {
        vehiculeId: vehicleId,
        annee: currentYear,
      },
      orderBy: {
        dateAllocation: 'desc',
      },
    });

    const totalAllocated = allocations.reduce((acc, curr) => acc + curr.montant, 0);

    // Calculate consumed budget from maintenance and fuel records for this year
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const maintenances = await this.prisma.maintenance.findMany({
      where: {
        vehiculeId: vehicleId,
        dateDebut: {
          gte: startDate,
          lte: endDate,
        },
        statut: 'TERMINEE',
      },
    });

    const fuelRecords = await this.prisma.fuelRecord.findMany({
      where: {
        vehiculeId: vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalSpentMaint = maintenances.reduce((acc, curr) => acc + (curr.montant || 0), 0);
    const totalSpentFuel = fuelRecords.reduce((acc, curr) => acc + curr.montant, 0);

    // Monthly breakdown
    const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: i,
        maintenance: 0,
        fuel: 0,
        total: 0
    }));

    maintenances.forEach(m => {
        const month = new Date(m.dateDebut).getMonth();
        if (month >= 0 && month < 12) {
            monthlyData[month].maintenance += (m.montant || 0);
            monthlyData[month].total += (m.montant || 0);
        }
    });

    fuelRecords.forEach(fr => {
        const month = new Date(fr.date).getMonth();
        if (month >= 0 && month < 12) {
            monthlyData[month].fuel += fr.montant;
            monthlyData[month].total += fr.montant;
        }
    });

    const response = {
      totalAllocated,
      totalSpent: totalSpentMaint + totalSpentFuel,
      totalSpentMaint,
      totalSpentFuel,
      allocations,
      monthlyData,
      maintenances: maintenances.sort((a, b) => b.dateDebut.getTime() - a.dateDebut.getTime()),
      fuelRecords: fuelRecords.sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
    return response;
  }
}
// Force recompilation
