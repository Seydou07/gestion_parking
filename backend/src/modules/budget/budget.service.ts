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

    return {
      totalAllocated,
      totalSpent: totalSpentMaint + totalSpentFuel,
      allocations,
    };
  }
}
