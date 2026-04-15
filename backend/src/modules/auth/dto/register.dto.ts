import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    prenom: string;

    @ApiProperty({ example: 'j.doe@ccva.bf' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'john.doe' })
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole, default: UserRole.GESTIONNAIRE })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
