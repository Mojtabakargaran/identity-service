import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Security
  app.use(helmet());
  app.enableCors({
    origin: [configService.get('app.frontendUrl'), 'http://localhost:3000'],
    credentials: true,
  });
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Identity Service API')
    .setDescription('Hospital Management Platform - Identity Service')
    .setVersion('1.0')
    .addTag('Tenants', 'Tenant registration and management')
    .addTag('Authentication', 'User authentication and verification')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = configService.get('app.port', 3001);
  await app.listen(port);
  
  console.log(`Identity Service running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
