import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        console.log(`[AUTH] Attempting login for identifier: ${loginDto.identifier}`);
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginDto.identifier },
                    { username: loginDto.identifier }
                ]
            },
        });

        if (!user) {
            console.warn(`[AUTH] User not found for identifier: ${loginDto.identifier}`);
            throw new UnauthorizedException('Identifiants invalides');
        }

        if (!user.actif) {
            console.warn(`[AUTH] User ${user.email} is inactive`);
            throw new UnauthorizedException('Identifiants invalides');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        const payload = { sub: user.id, email: user.email, username: user.username, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
            },
        };
    }

    async register(registerDto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                nom: registerDto.nom,
                prenom: registerDto.prenom,
                email: registerDto.email,
                username: registerDto.username,
                password: hashedPassword,
                role: registerDto.role,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async validateUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.actif) {
            throw new UnauthorizedException('Utilisateur non autorisé');
        }
        const { password, ...result } = user;
        return result;
    }
}
