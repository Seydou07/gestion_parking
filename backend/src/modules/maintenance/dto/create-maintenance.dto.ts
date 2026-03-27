import { IsNotEmpty, IsInt, IsString, IsEnum, IsDate, IsOptional, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceType, MaintenanceStatus, PaymentMethod, MaintenancePaymentSource } from '@prisma/client';

export class MaintenanceItemDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsInt()
    @IsNotEmpty()
    quantite: number;

    @IsNumber()
    @IsNotEmpty()
    prixUnitaire: number;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsOptional()
    @IsEnum(MaintenancePaymentSource)
    sourcePaiement?: MaintenancePaymentSource;
}

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

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dateDebut: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateFin?: Date;

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

    @IsOptional()
    @IsNumber()
    mainDoeuvre?: number;

    @IsOptional()
    @IsEnum(MaintenancePaymentSource)
    sourceMainDoeuvre?: MaintenancePaymentSource;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaintenanceItemDto)
    items?: MaintenanceItemDto[];
}
