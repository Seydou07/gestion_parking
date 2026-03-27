import { IsEnum, IsInt, IsOptional, IsDateString, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MissionStatus } from '@prisma/client';

export class UpdateMissionDto {
    @ApiProperty({ enum: MissionStatus })
    @IsEnum(MissionStatus)
    @IsOptional()
    statut?: MissionStatus;

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    dateRetour?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    kmDepart?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    kmRetour?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observationDepart?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observationRetour?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    montantCarburantUtilise?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    lettreMission?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observations?: string;
}
