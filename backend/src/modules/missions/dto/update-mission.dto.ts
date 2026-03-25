import { IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
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
    kmRetour?: number;

    @ApiProperty()
    @IsOptional()
    observations?: string;
}
