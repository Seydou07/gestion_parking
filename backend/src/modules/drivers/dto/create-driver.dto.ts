import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
    @ApiProperty({ example: 'Traoré' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ example: 'Issa' })
    @IsString()
    @IsNotEmpty()
    prenom: string;

    @ApiProperty({ example: 'B12345678' })
    @IsString()
    @IsNotEmpty()
    permisNumero: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    permisExpiration: string;

    @ApiProperty({ example: 'B, C, D' })
    @IsString()
    @IsOptional()
    permisCategories?: string;

    @ApiProperty({ example: '+226 70 00 00 00' })
    @IsString()
    @IsNotEmpty()
    telephone: string;


    @ApiProperty({ enum: DriverStatus })
    @IsEnum(DriverStatus)
    @IsOptional()
    statut?: DriverStatus;

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    dateNaissance?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    adresse?: string;


    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}
