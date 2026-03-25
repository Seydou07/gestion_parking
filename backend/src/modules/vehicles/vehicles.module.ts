import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { HistoryModule } from '../history/history.module';
import { BudgetModule } from '../budget/budget.module';

@Module({
    imports: [HistoryModule, BudgetModule],
    controllers: [VehiclesController],
    providers: [VehiclesService],
    exports: [VehiclesService],
})
export class VehiclesModule { }
