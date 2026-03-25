import { Controller, Get, Patch, Param, Post, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alertes')
@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    findAll() {
        return this.alertsService.findAll();
    }

    @Get('unread')
    findUnread() {
        return this.alertsService.findUnread();
    }

    @Patch(':id/read')
    markAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.alertsService.markAsRead(id);
    }

    @Post('check')
    checkAlerts() {
        return this.alertsService.checkAlerts();
    }
}
