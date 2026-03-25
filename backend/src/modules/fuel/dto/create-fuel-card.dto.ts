import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateFuelCardDto {
    @IsString()
    @IsNotEmpty()
    numero: string;

    @IsNumber()
    @IsNotEmpty()
    soldeInitial: number;

    @IsNumber()
    @IsNotEmpty()
    solde: number;

    @IsNumber()
    @IsOptional()
    plafond?: number;

    @IsDateString()
    @IsNotEmpty()
    dateExpiration: string;

    @IsString()
    @IsOptional()
    fournisseur?: string;
}
