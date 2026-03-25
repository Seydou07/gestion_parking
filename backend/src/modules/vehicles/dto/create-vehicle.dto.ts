import { IsNotEmpty, IsString, IsInt, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus, FuelType } from '@prisma/client';

export class CreateVehicleDto {
    @ApiProperty({ example: '1234 XY 01' })
    @IsString()
    @IsNotEmpty()
    immatriculation: string;

    @ApiProperty({ example: 'Toyota' })
    @IsString()
    @IsNotEmpty()
    marque: string;

    @ApiProperty({ example: 'Hilux' })
    @IsString()
    @IsNotEmpty()
    modele: string;

    @ApiProperty({ example: 2022 })
    @IsInt()
    annee: number;

    @ApiProperty({ example: 45000 })
    @IsInt()
    @IsOptional()
    kilometrage?: number;

    @ApiProperty({ enum: VehicleStatus })
    @IsEnum(VehicleStatus)
    @IsOptional()
    statut?: VehicleStatus;

    @ApiProperty({ enum: FuelType })
    @IsEnum(FuelType)
    @IsOptional()
    typeCarburant?: FuelType;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    capaciteReservoir?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    numeroChassis?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    couleur?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    dateAcquisition?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    prixAcquisition?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    transmission?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    assuranceNumero?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    assuranceCompagnie?: string;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    assuranceExpiration?: string;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    prochainControle?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    derniereVidangeKilometrage?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    frequenceVidange?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    budgetAlloue?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    budgetInitial?: number;
}
