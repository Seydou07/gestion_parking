import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin_fleet' })
    @IsNotEmpty({ message: 'L\'identifiant est requis' })
    identifier: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty({ message: 'Le mot de passe est requis' })
    @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
    password: string;
}
