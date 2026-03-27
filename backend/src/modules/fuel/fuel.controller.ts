import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FuelService } from './fuel.service';
import { CreateFuelRecordDto } from './dto/create-fuel-record.dto';
import { CreateFuelCardDto } from './dto/create-fuel-card.dto';
import { CreateFuelVoucherDto } from './dto/create-fuel-voucher.dto';

@ApiTags('Carburant')
@Controller('fuel')
export class FuelController {
    constructor(private readonly fuelService: FuelService) { }

    @Post('records')
    @ApiOperation({ summary: 'Enregistrer une consommation de carburant' })
    createRecord(@Body() dto: CreateFuelRecordDto) {
        return this.fuelService.createRecord(dto);
    }

    @Get('records')
    findAllRecords() {
        return this.fuelService.findAllRecords();
    }

    @Post('cards')
    createCard(@Body() dto: CreateFuelCardDto) {
        return this.fuelService.createCard(dto);
    }

    @Get('cards')
    findAllCards() {
        return this.fuelService.findAllCards();
    }

    @Post('vouchers')
    createVoucher(@Body() dto: CreateFuelVoucherDto) {
        return this.fuelService.createVoucher(dto);
    }

    @Get('vouchers')
    findAllVouchers() {
        return this.fuelService.findAllVouchers();
    }

    @Get('stats')
    getStats() {
        return this.fuelService.getStats();
    }

    @Patch('cards/:id/recharge')
    rechargeCard(@Param('id', ParseIntPipe) id: number, @Body('amount') amount: number) {
        return this.fuelService.rechargeCard(id, amount);
    }

    @Patch('cards/:id')
    updateCard(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        return this.fuelService.updateCard(id, dto);
    }

    @Get('stats/vehicle/:id')
    @ApiOperation({ summary: 'Statistiques de consommation par véhicule' })
    getVehicleConsumption(@Param('id', ParseIntPipe) id: number) {
        return this.fuelService.getVehicleConsumption(id);
    }
}
