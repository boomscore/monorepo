import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

// Configuration
import configuration, { validationSchema } from '@/config/configuration';
import { DatabaseConfigService } from '@/config/database.config';

// Common modules
import { CommonModule } from '@/common/common.module';
import { HealthModule } from '@/health/health.module';
import { MetricsModule } from '@/metrics/metrics.module';

// Feature modules
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SportsModule } from '@/modules/sports/sports.module';
import { PredictionsModule } from '@/modules/predictions/predictions.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { PaymentsModule } from '@/modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'), // Try current directory first
        join(process.cwd(), '..', '..', '.env'), // Try monorepo root
        join(__dirname, '..', '..', '..', '..', '.env'), // Try from dist folder
      ],
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        driver: ApolloDriver,
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        introspection: configService.get('NODE_ENV') === 'development',
        playground: false,
        context: ({ req, res }) => ({ req, res }),
        formatError: error => {
          const { message, locations, path, extensions } = error;
          return {
            message,
            locations,
            path,
            extensions: {
              code: extensions?.code || 'INTERNAL_ERROR',
              timestamp: new Date().toISOString(),
            },
          };
        },
        plugins:
          configService.get('NODE_ENV') === 'development'
            ? [
                ApolloServerPluginLandingPageLocalDefault({
                  embed: true,
                  includeCookies: true,
                }),
              ]
            : [],
      }),
      inject: [ConfigService],
    }),

    // Job queues
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') || undefined,
          db: configService.get('REDIS_DB'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get('RATE_LIMIT_TTL') * 1000,
          limit: configService.get('RATE_LIMIT_MAX'),
        },
        {
          name: 'auth',
          ttl: 60 * 1000, // 1 minute
          limit: 5, // 5 attempts per minute for auth endpoints
        },
        {
          name: 'predictions',
          ttl: 60 * 1000, // 1 minute
          limit: 10, // 10 predictions per minute
        },
        {
          name: 'chat',
          ttl: 60 * 1000, // 1 minute
          limit: 20, // 20 messages per minute
        },
      ],
      inject: [ConfigService],
    }),

    // Core modules
    CommonModule,
    HealthModule,
    MetricsModule,

    // Feature modules
    UsersModule,
    AuthModule,
    SportsModule,
    PredictionsModule,
    ChatModule,
    PaymentsModule,
  ],
})
export class AppModule {}
