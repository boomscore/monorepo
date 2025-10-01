/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  console.log('Starting application bootstrap...');

  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    console.log('NestJS application created successfully');

    console.log('Getting ConfigService and LoggerService...');
    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);
    app.useLogger(logger);
    console.log('Services configured successfully');

    console.log('Setting up security middleware...');
    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP for GraphQL Playground
        crossOriginEmbedderPolicy: false,
      }),
    );

    app.use(compression());
    app.use(cookieParser());
    console.log('Security middleware configured');

    console.log('Setting up CORS...');
    // CORS configuration
    app.enableCors({
      origin: configService.get<string[]>('CORS_ORIGINS', [
        'http://localhost:3000',
        'http://localhost:3001',
      ]),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Forwarded-For'],
    });
    console.log('CORS configured');

    console.log('Setting up global pipes and filters...');
    // Global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter(logger));
    app.useGlobalInterceptors(new ResponseInterceptor(logger));
    console.log('Global pipes and filters configured');

    console.log('Enabling shutdown hooks...');
    // Graceful shutdown
    app.enableShutdownHooks();

    console.log('Starting server...');
    const port = configService.get<number>('PORT', 4000);
    await app.listen(port, '0.0.0.0');

    Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
    Logger.log(`GraphQL endpoint: http://localhost:${port}/graphql`, 'Bootstrap');
    Logger.log(`Health check: http://localhost:${port}/health`, 'Bootstrap');
    Logger.log(`Metrics endpoint: http://localhost:${port}/metrics`, 'Bootstrap');
  } catch (error) {
    console.error('Error during bootstrap:', error);
    Logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap().catch(error => {
  console.error('Bootstrap function failed:', error);
  Logger.error('Failed to start application', error);
  process.exit(1);
});
