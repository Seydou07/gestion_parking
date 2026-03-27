import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) { }

    async log(action: string, module: string, details?: string, userId?: number, entiteId?: number, entiteType?: string) {
        return this.prisma.historyLog.create({
            data: { 
                action, 
                module, 
                details, 
                utilisateurId: userId,
                entiteId,
                entiteType
            },
        });
    }

    async findAll() {
        return this.prisma.historyLog.findMany({
            include: { utilisateur: { select: { nom: true, prenom: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
}
