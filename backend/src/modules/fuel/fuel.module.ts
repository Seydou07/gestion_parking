import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { HistoryModule } from '../history/history.module';

@Module({
    imports: [HistoryModule],
    controllers: [FuelController],
    providers: [FuelService],
    exports: [FuelService],
})
export class FuelModule { }
