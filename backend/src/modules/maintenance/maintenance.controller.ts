import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@ApiTags('Maintenance & Pannes')
@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()

    create(@Body() dto: CreateMaintenanceDto) {
        return this.maintenanceService.create(dto);
    }

    @Get()
    findAll() {
        return this.maintenanceService.findAll();
    }

    @Get('upcoming')
    getUpcoming() {
        return this.maintenanceService.getUpcoming();
    }

    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaintenanceDto) {
        return this.maintenanceService.update(id, dto);
    }
}
