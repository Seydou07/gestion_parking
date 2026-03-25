import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    @IsInt()
    @IsNotEmpty()
    kmDepart: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    observations?: string;
}
