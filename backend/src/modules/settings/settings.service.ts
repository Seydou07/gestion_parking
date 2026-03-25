import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService
    ) { }

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
        const settings = await this.prisma.systemSettings.update({
            where: { id: 1 },
            data: dto,
        });

        await this.historyService.log(
            'MISE_A_JOUR',
            'SETTINGS',
            `Mise à jour des paramètres du système`
        );

        return settings;
    }
}
