import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService
    ) { }

    async create(createDriverDto: CreateDriverDto) {
        const data: any = { ...createDriverDto };
        if (data.permisExpiration) data.permisExpiration = new Date(data.permisExpiration);
        if (data.dateNaissance) data.dateNaissance = new Date(data.dateNaissance);
        
        const driver = await this.prisma.driver.create({ data });
        await this.historyService.log(
            'CRÉATION',
            'CHAUFFEUR',
            `Ajout du chauffeur ${driver.prenom} ${driver.nom}`
        );
        return driver;
    }

    async findAll() {
        return this.prisma.driver.findMany({
            include: {
                _count: {
                    select: { missions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: {
                missions: { take: 10, orderBy: { dateDepart: 'desc' }, include: { vehicule: true } },
            },
        });
        if (!driver) throw new NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
        return driver;
    }

    async update(id: number, updateDriverDto: UpdateDriverDto) {
        const data: any = { ...updateDriverDto };
        if (data.permisExpiration) data.permisExpiration = new Date(data.permisExpiration);
        if (data.dateNaissance) data.dateNaissance = new Date(data.dateNaissance);
        
        const driver = await this.prisma.driver.update({
            where: { id },
            data,
        });
        await this.historyService.log(
            'MODIFICATION',
            'CHAUFFEUR',
            `Mise à jour du chauffeur ${driver.prenom} ${driver.nom}`
        );
        return driver;
    }

    async remove(id: number) {
        const driver = await this.prisma.driver.delete({
            where: { id },
        });
        await this.historyService.log(
            'SUPPRESSION',
            'CHAUFFEUR',
            `Suppression du chauffeur ${driver.prenom} ${driver.nom}`
        );
        return driver;
    }
}
