import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [PrismaModule, HistoryModule],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
