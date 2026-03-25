import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@ApiTags('Véhicules')
@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    @ApiOperation({ summary: 'Ajouter un nouveau véhicule' })
    create(@Body() createVehicleDto: CreateVehicleDto) {
        return this.vehiclesService.create(createVehicleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Liste de tous les véhicules' })
    findAll() {
        return this.vehiclesService.findAll();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Statistiques globales du parc' })
    getStats() {
        return this.vehiclesService.getStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'un véhicule' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.vehiclesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Modifier un véhicule' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateVehicleDto: UpdateVehicleDto) {
        return this.vehiclesService.update(id, updateVehicleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un véhicule' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.vehiclesService.remove(id);
    }
}
