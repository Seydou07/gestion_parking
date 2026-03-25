import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Statistiques')
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('dashboard')
    getDashboardStats() {
        return this.statsService.getDashboardStats();
    }

    @Get('monthly-expenses')
    getMonthlyExpenses(@Query('year') year: string) {
        return this.statsService.getMonthlyExpenses(+year || new Date().getFullYear());
    }
}
