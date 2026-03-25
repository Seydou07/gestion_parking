import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { MissionsModule } from './modules/missions/missions.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { HistoryModule } from './modules/history/history.module';
import { BudgetModule } from './modules/budget/budget.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        VehiclesModule,
        DriversModule,
        MissionsModule,
        FuelModule,
        MaintenanceModule,
        UsersModule,
        StatsModule,
        AlertsModule,
        HistoryModule,
        BudgetModule,
        SettingsModule,
    ],
})
export class AppModule { }
