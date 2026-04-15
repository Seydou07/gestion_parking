import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MissionStatus } from '@prisma/client';

export class CreateMissionDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    vehiculeId: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    chauffeurId: number;

    @ApiProperty({ example: 'Ouagadougou -> Bobo-Dioulasso' })
    @IsString()
    @IsNotEmpty()
    destination: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    objectif?: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    dateDepart: string;

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    dateRetour?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    kmDepart?: number;

    @ApiProperty()
    @IsEnum(MissionStatus)
    @IsOptional()
    statut?: MissionStatus;

    @ApiProperty()
    @IsString()
    @IsOptional()
    typeCarburantDotation?: string;

    @ApiProperty({ type: [Number], example: [1, 2] })
    @IsInt({ each: true })
    @IsOptional()
    bonCarburantIds?: number[];

    @ApiProperty()
    @IsInt()
    @IsOptional()
    carteCarburantId?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    lettreMission?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observations?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observationDepart?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observationRetour?: string;
}
