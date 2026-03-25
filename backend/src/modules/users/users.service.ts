import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true, createdAt: true },
        });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return user;
    }

    async updateRole(id: number, role: UserRole) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }

    async toggleActive(id: number) {
        const user = await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { actif: !user.actif },
        });
    }
}
