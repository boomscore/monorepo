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
        const corsOrigins =
          configService.get<string>('CORS_ORIGINS') ||
          'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:4000';
        const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());

        const serverPort = configService.get<number>('PORT', 4000);
        const playgroundOrigin = `http://localhost:${serverPort}`;
        if (!allowedOrigins.includes(playgroundOrigin)) {
          allowedOrigins.push(playgroundOrigin);
        }

        const apolloStudio = 'https://studio.apollographql.com';
        if (!allowedOrigins.includes(apolloStudio)) {
          allowedOrigins.push(apolloStudio);
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          logger.warn(
            `CORS: Origin not allowed: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`,
          );
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

    const port = configService.get<number>('PORT', 4000);
    logger.log('About to start server on port ' + port);

    await app.listen(port);

    Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
    Logger.log(`GraphQL endpoint: http://localhost:${port}/graphql`, 'Bootstrap');
    Logger.log(`Health check: http://localhost:${port}/health`, 'Bootstrap');
    Logger.log(`Metrics endpoint: http://localhost:${port}/metrics`, 'Bootstrap');
    const sportsSyncService = app.get(SportsSyncService);
    setImmediate(async () => {
      try {
        await sportsSyncService.initializeIfNeeded();
        logger.log('MAIN: Sports data initialization complete');
      } catch (error) {
        logger.error('MAIN: Sports data initialization failed', error);
      }
    });
  } catch (error) {
    Logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap().catch(error => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});
