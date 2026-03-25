import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
    constructor(private readonly missionsService: MissionsService) { }

    @Post()

    @ApiOperation({ summary: 'Créer une nouvelle mission (affectation auto)' })
    create(@Body() createMissionDto: CreateMissionDto) {
        return this.missionsService.create(createMissionDto);
    }

    @Get()
    findAll() {
        return this.missionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.missionsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour une mission (clôture auto)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateMissionDto: UpdateMissionDto) {
        return this.missionsService.update(id, updateMissionDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.missionsService.remove(id);
    }
}
