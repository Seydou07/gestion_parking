import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    app.enableCors({
        origin: [/http:\/\/localhost:\d+/], // Allow any local port
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
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
        .setTitle('CCVA Fleet Management API')
        .setDescription('API de gestion de flotte automobile du CCVA')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 CCVA Fleet API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
