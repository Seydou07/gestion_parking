import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, nom: true, prenom: true, username: true, email: true, role: true, actif: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, nom: true, prenom: true, username: true, email: true, role: true, actif: true, createdAt: true },
        });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return user;
    }

    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: { id: true, nom: true, prenom: true, username: true, email: true, role: true, actif: true },
        });
    }

    async updatePassword(id: number, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
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

    async remove(id: number) {
        await this.findOne(id); // Ensure user exists
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
