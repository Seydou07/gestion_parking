import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { VehicleStatus, DriverStatus, MissionStatus } from '@prisma/client';

@Injectable()
export class MissionsService {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService
    ) { }

    async create(createMissionDto: CreateMissionDto) {
        // Check if vehicle and driver are available
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: createMissionDto.vehiculeId } });
        const driver = await this.prisma.driver.findUnique({ where: { id: createMissionDto.chauffeurId } });

        if (!vehicle || vehicle.statut !== VehicleStatus.DISPONIBLE) {
            throw new BadRequestException('Le véhicule n\'est pas disponible');
        }
        if (!driver || driver.statut !== DriverStatus.DISPONIBLE) {
            throw new BadRequestException('Le chauffeur n\'est pas disponible');
        }

        const status = createMissionDto.statut || MissionStatus.PLANIFIEE;
        const { bonCarburantIds, ...rest } = createMissionDto;

        return this.prisma.$transaction(async (tx) => {
            const mission = await tx.mission.create({
                data: {
                    ...rest,
                    dateDepart: new Date(createMissionDto.dateDepart),
                    dateRetour: createMissionDto.dateRetour ? new Date(createMissionDto.dateRetour) : null,
                    statut: status,
                },
            });

            // Mark multiple vouchers as used if assigned
            if (createMissionDto.typeCarburantDotation === 'BON' && bonCarburantIds?.length) {
                await tx.fuelVoucher.updateMany({
                    where: { id: { in: bonCarburantIds } },
                    data: { statut: 'UTILISE', missionId: mission.id }
                });
            }

            // Only update vehicle/driver status if mission starts immediately
            if (status === MissionStatus.EN_COURS) {
                await tx.vehicle.update({
                    where: { id: createMissionDto.vehiculeId },
                    data: { statut: VehicleStatus.EN_MISSION },
                });

                await tx.driver.update({
                    where: { id: createMissionDto.chauffeurId },
                    data: { statut: DriverStatus.EN_MISSION },
                });

                await this.historyService.log(
                    'DÉPART MISSION',
                    'MISSION',
                    `Départ immédiat en mission pour ${mission.destination} (Chauffeur: ${driver.nom}, Véhicule: ${vehicle.immatriculation})`,
                    undefined,
                    mission.id,
                    'MISSION'
                );
            } else {
                await this.historyService.log(
                    'PLANIFICATION MISSION',
                    'MISSION',
                    `Mission planifiée pour ${mission.destination} (Chauffeur: ${driver.nom}, Véhicule: ${vehicle.immatriculation})`,
                    undefined,
                    mission.id,
                    'MISSION'
                );
            }

            return mission;
        });
    }

    async findAll() {
        return this.prisma.mission.findMany({
            include: {
                vehicule: true,
                chauffeur: true,
                vouchers: true,
            },
            orderBy: { dateDepart: 'desc' },
        });
    }

    async findOne(id: number) {
        const mission = await this.prisma.mission.findUnique({
            where: { id },
            include: { vehicule: true, chauffeur: true, vouchers: true },
        });
        if (!mission) throw new NotFoundException(`Mission #${id} non trouvée`);
        return mission;
    }

    async update(id: number, updateMissionDto: UpdateMissionDto) {
        const currentMission = await this.prisma.mission.findUnique({
            where: { id },
            include: { vouchers: true, vehicule: true, chauffeur: true }
        });
        if (!currentMission) throw new NotFoundException(`Mission #${id} non trouvée`);

        const { bonCarburantIds, ...rest } = updateMissionDto;

        return this.prisma.$transaction(async (tx) => {
            const mission = await tx.mission.update({
                where: { id },
                data: {
                    ...rest,
                    dateRetour: updateMissionDto.dateRetour ? new Date(updateMissionDto.dateRetour) : undefined,
                },
            });

            // Handle multi-voucher changes
            if (updateMissionDto.typeCarburantDotation === 'BON' && bonCarburantIds) {
                // 1. Dissociate all vouchers currently linked to this mission
                await tx.fuelVoucher.updateMany({
                    where: { missionId: id },
                    data: { statut: 'DISPONIBLE', missionId: null }
                });

                // 2. Link the new set of vouchers
                await tx.fuelVoucher.updateMany({
                    where: { id: { in: bonCarburantIds } },
                    data: { statut: 'UTILISE', missionId: mission.id }
                });
            } else if (updateMissionDto.typeCarburantDotation !== 'BON' && currentMission.vouchers.length > 0) {
                // If dotation type changed from BON to something else, release vouchers
                await tx.fuelVoucher.updateMany({
                    where: { missionId: id },
                    data: { statut: 'DISPONIBLE', missionId: null }
                });
            }

            // Transition from PLANIFIEE to EN_COURS (Check-out)
            if (currentMission.statut === MissionStatus.PLANIFIEE && updateMissionDto.statut === MissionStatus.EN_COURS) {
                await tx.vehicle.update({
                    where: { id: currentMission.vehiculeId },
                    data: { statut: VehicleStatus.EN_MISSION },
                });

                await tx.driver.update({
                    where: { id: currentMission.chauffeurId },
                    data: { statut: DriverStatus.EN_MISSION },
                });

                await this.historyService.log(
                    'DÉPART MISSION',
                    'MISSION',
                    `Départ en mission pour ${mission.destination} (Chauffeur: ${currentMission.chauffeur.nom}, Véhicule: ${currentMission.vehicule.immatriculation})`,
                    undefined,
                    mission.id,
                    'MISSION'
                );
            }

            // If mission is completed or cancelled, release vehicle and driver
            if (
                updateMissionDto.statut === MissionStatus.TERMINEE ||
                updateMissionDto.statut === MissionStatus.ANNULEE
            ) {
                await tx.vehicle.update({
                    where: { id: currentMission.vehiculeId },
                    data: {
                        statut: VehicleStatus.DISPONIBLE,
                        kilometrage: updateMissionDto.kmRetour || currentMission.vehicule.kilometrage
                    },
                });

                await tx.driver.update({
                    where: { id: currentMission.chauffeurId },
                    data: { statut: DriverStatus.DISPONIBLE },
                });

                // Deduct from fuel card if mission is completed
                const fuelAmount = updateMissionDto.montantCarburantUtilise ?? currentMission.montantCarburantUtilise ?? 0;
                if (updateMissionDto.statut === MissionStatus.TERMINEE && 
                    currentMission.typeCarburantDotation === 'CARTE' && 
                    currentMission.carteCarburantId && 
                    fuelAmount > 0) {
                    
                    await tx.fuelCard.update({
                        where: { id: currentMission.carteCarburantId },
                        data: { solde: { decrement: fuelAmount } }
                    });

                    await this.historyService.log(
                        'DÉBIT CARBURANT',
                        'CARBURANT',
                        `Débit de ${fuelAmount} FCFA sur la carte #${currentMission.carteCarburantId} (Mission #${id})`,
                        undefined,
                        currentMission.carteCarburantId,
                        'FUEL_CARD'
                    );
                }

                await this.historyService.log(
                    updateMissionDto.statut === MissionStatus.TERMINEE ? 'RETOUR MISSION' : 'ANNULATION MISSION',
                    'MISSION',
                    `Mission #${mission.id} pour ${mission.destination} marquée comme ${mission.statut.toLowerCase()}`,
                    undefined,
                    mission.id,
                    'MISSION'
                );
            }

            return mission;
        });
    }


    async remove(id: number) {
        return this.prisma.mission.delete({ where: { id } });
    }
}
