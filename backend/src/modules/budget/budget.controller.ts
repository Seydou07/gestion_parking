import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { AllocateBudgetDto } from './dto/allocate-budget.dto';
import { SupplyGlobalBudgetDto } from './dto/supply-global-budget.dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('allocate')
  allocate(@Body() dto: AllocateBudgetDto) {
    return this.budgetService.allocate(dto);
  }

  @Get('summary')
  getSummary() {
    return this.budgetService.getBudgetSummary();
  }

  @Post('global/supply')
  supplyGlobal(@Body() dto: SupplyGlobalBudgetDto) {
    return this.budgetService.supplyGlobalBudget(dto);
  }

  @Post('global/initialize')
  initializeGlobal(@Body() dto: SupplyGlobalBudgetDto) {
    return this.budgetService.initializeGlobalBudget(dto);
  }

  @Get('global/history')
  getGlobalHistory() {
    return this.budgetService.getGlobalHistory();
  }

  @Get('vehicle/:id')
  getVehicleBudget(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: number,
  ) {
    return this.budgetService.getVehicleBudget(id, year ? Number(year) : undefined);
  }
}
