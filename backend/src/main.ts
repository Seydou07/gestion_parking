import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    const frontendUrl = process.env.FRONTEND_URL;
    const extraOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
    
    // Base origins (localhost always allowed)
    const allowedOrigins: (string | RegExp)[] = [
        /http:\/\/localhost:\d+/,
        /https:\/\/.*\.vercel\.app$/, // Autorise tous les sous-domaines Vercel
    ];

    // Add origins from FRONTEND_URL and ALLOWED_ORIGINS
    [
        ...(frontendUrl ? frontendUrl.split(',') : []),
        ...extraOrigins
    ].forEach(url => {
        const cleanUrl = url.trim().replace(/\/$/, '');
        if (cleanUrl) {
            allowedOrigins.push(cleanUrl);
            // Regex pour gérer les variations
            allowedOrigins.push(new RegExp(`^${cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
        }
    });

    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Route de santé simple
    app.use('/health', (req, res) => res.send('OK'));

    // Logger de requêtes pour le débug (placé APRÈS cors pour voir si ça passe)
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });


    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            exceptionFactory: (errors) => {
                console.error('VALIDATION ERROR:', JSON.stringify(errors, null, 2));
                return new BadRequestException(errors);
            }
        }),
    );

    // Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('FleetGuardian API')
        .setDescription('API de gestion de flotte automobile')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');

    // --- SEED DE SECOURS (Startup Seed) ---
    // Si aucun utilisateur n'existe, on crée l'admin par défaut
    const prisma = app.get(PrismaService);
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        console.log('🏁 [Startup Seed] Database empty. Creating default admin...');
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash('admin_123', 10);
        await prisma.user.create({
            data: {
                email: 'admin@admin.com',
                username: 'admin_fleet',
                nom: 'SYSTEM',
                prenom: 'ADMIN',
                password: hashedPassword,
                role: 'ROOT_ADMIN' as any,
                actif: true
            }
        });
        console.log('✅ [Startup Seed] Admin user created: admin_fleet / admin_123');
    }

    console.log('--- FLEET GUARDIAN SERVER IS RUNNING (VER 2.0) ---');
    console.log(`Application is running on port: ${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
