import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    const frontendUrl = process.env.FRONTEND_URL;
    const allowedOrigins: (string | RegExp)[] = [
        /http:\/\/localhost:\d+/,
        /https:\/\/.*\.vercel\.app/, // Autorise tous les domaines Vercel par précaution
    ];

    if (frontendUrl) {
        const origins = frontendUrl.split(',').map(url => url.trim());
        origins.forEach(url => {
            const cleanUrl = url.replace(/\/$/, '');
            allowedOrigins.push(cleanUrl); // Ajout direct de la chaîne pour plus de fiabilité
            // Conserver aussi le regex pour gérer le slash final optionnel
            allowedOrigins.push(new RegExp(`^${cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
        });
    }

    // CORS simplifié au maximum pour test
    app.enableCors({
        origin: true,
        methods: '*',
        credentials: true,
        allowedHeaders: '*',
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
    console.log('--- FLEET GUARDIAN SERVER IS RUNNING (VER 2.0) ---');
    console.log(`Application is running on port: ${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
