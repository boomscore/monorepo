import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerService } from './common/services/logger.service';
import { AppModule } from './app.module';
import { SportsSyncService } from './modules/sports/services/sports-sync.service';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);
    app.useLogger(logger);

    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP for GraphQL Playground
        crossOriginEmbedderPolicy: false,
      }),
    );

    app.use(compression());
    app.use(cookieParser());

    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = configService.get<string[]>('CORS_ORIGINS', [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
        ]);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Forwarded-For'],
    });

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

    // Graceful shutdown
    app.enableShutdownHooks();

    // Initialize sports data automatically (core application functionality)
    if (configService.get<boolean>('SPORTS_INIT_ON_START', true)) {
      try {
        logger.log('MAIN: Starting sports data initialization...');
        const sportsSyncService = app.get(SportsSyncService);
        logger.log('MAIN: Got SportsSyncService, calling initializeIfNeeded...');
        await sportsSyncService.initializeIfNeeded();
        logger.log('Sports data initialization complete');
      } catch (error: unknown) {
        logger.warn(
          'Sports data initialization failed:',
          (error instanceof Error ? error.message : String(error)) as any,
        );
        // Don't fail the entire app startup for sports data issues
      }
    } else {
      logger.log('SPORTS_INIT_ON_START is disabled');
    }

    const port = configService.get<number>('PORT', 4000);
    await app.listen(port, '0.0.0.0');

    Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
    Logger.log(`GraphQL endpoint: http://localhost:${port}/graphql`, 'Bootstrap');
    Logger.log(`Health check: http://localhost:${port}/health`, 'Bootstrap');
    Logger.log(`Metrics endpoint: http://localhost:${port}/metrics`, 'Bootstrap');
  } catch (error) {
    Logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap().catch(error => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});
