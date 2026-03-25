import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        // Ensure settings exist on startup
        const settings = await this.prisma.systemSettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            await this.prisma.systemSettings.create({
                data: { id: 1 }
            });
        }
    }

    async getSettings() {
        return this.prisma.systemSettings.findUnique({ where: { id: 1 } });
    }

    async updateSettings(dto: UpdateSettingsDto) {
        return this.prisma.systemSettings.update({
            where: { id: 1 },
            data: dto,
        });
    }
}
