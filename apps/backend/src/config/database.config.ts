import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// Entities
import { User } from '@/modules/users/entities/user.entity';
import { Device } from '@/modules/auth/entities/device.entity';
import { Session } from '@/modules/auth/entities/session.entity';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity';
import { Sport } from '@/modules/sports/entities/sport.entity';
import { League } from '@/modules/sports/entities/league.entity';
import { Season } from '@/modules/sports/entities/season.entity';
import { Team } from '@/modules/sports/entities/team.entity';
import { Match } from '@/modules/sports/entities/match.entity';
import { MatchEvent } from '@/modules/sports/entities/match-event.entity';
import { Prediction } from '@/modules/predictions/entities/prediction.entity';
import { PredictionBatch } from '@/modules/predictions/entities/prediction-batch.entity';
import { Conversation } from '@/modules/chat/entities/conversation.entity';
import { ChatMessage } from '@/modules/chat/entities/chat-message.entity';
import { Subscription } from '@/modules/payments/entities/subscription.entity';
import { Payment } from '@/modules/payments/entities/payment.entity';

const entities = [
  User,
  Device,
  Session,
  RefreshToken,
  Sport,
  League,
  Season,
  Team,
  Match,
  MatchEvent,
  Prediction,
  PredictionBatch,
  Conversation,
  ChatMessage,
  Subscription,
  Payment,
];

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const shouldSync = nodeEnv === 'development';

    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      ssl: this.configService.get<boolean>('DATABASE_SSL') ? { rejectUnauthorized: false } : false,
      entities,
      synchronize: shouldSync, // Enable sync for development
      logging: this.configService.get<boolean>('DATABASE_LOGGING'),
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: false, // Don't auto-run to avoid race conditions
      autoLoadEntities: true,
      retryAttempts: 3,
      retryDelay: 3000,
      maxQueryExecutionTime: 10000,
      extra: {
        max: 20, // Maximum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Abort long-running statements/queries to avoid hangs
        statement_timeout: 5000, // ms
        query_timeout: 5000, // ms (node-postgres driver)
      },
    };
  }
}

// For migrations and CLI usage
const config = {
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'boomscore',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === 'true',
  migrationsTableName: 'typeorm_migrations',
} as DataSourceOptions;

export const dataSource = new DataSource(config);
export default config;
