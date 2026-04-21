import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Connexion utilisateur' })
    @ApiResponse({ status: 200, description: 'Token JWT retourné' })
    @ApiResponse({ status: 401, description: 'Identifiants invalides' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @ApiOperation({ summary: 'Inscription utilisateur (admin uniquement)' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
    @ApiResponse({ status: 200, description: 'Profil utilisateur' })
    @ApiResponse({ status: 401, description: 'Non autorisé' })
    async getProfile(@Req() req: any) {
        return req.user;
    }
}
