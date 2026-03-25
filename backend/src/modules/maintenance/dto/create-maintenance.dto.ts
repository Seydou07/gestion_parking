import { IsNotEmpty, IsInt, IsString, IsEnum, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { MaintenanceType, MaintenanceStatus, PaymentMethod } from '@prisma/client';

export class CreateMaintenanceDto {
    @IsInt()
    @IsNotEmpty()
    vehiculeId: number;

    @IsEnum(MaintenanceType)
    @IsNotEmpty()
    type: MaintenanceType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    dateDebut: string;

    @IsOptional()
    @IsDateString()
    dateFin?: string;

    @IsOptional()
    @IsNumber()
    montant?: number;

    @IsOptional()
    @IsEnum(MaintenanceStatus)
    statut?: MaintenanceStatus;

    @IsOptional()
    @IsString()
    garage?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    modePaiement?: PaymentMethod;

    @IsOptional()
    @IsInt()
    carteCarburantId?: number;

    @IsOptional()
    @IsInt()
    bonEssenceId?: number;
}
