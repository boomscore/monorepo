import * as Joi from 'joi';

export interface Configuration {
  // Application
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SSL: boolean;
  DATABASE_LOGGING: boolean;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  // External APIs
  SPORT_API_KEY: string;
  SPORT_API_BASE_URL: string;
  OPENAI_API_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  RESEND_API_KEY: string;

  // Rate Limiting
  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;

  // Features
  SPORTS_SYNC_ENABLED: boolean;
  SPORTS_SYNC_INTERVAL: string;
  PREDICTIONS_ENABLED: boolean;
  CHAT_ENABLED: boolean;
  PAYMENTS_ENABLED: boolean;

  // Observability
  METRICS_ENABLED: boolean;
  TRACING_ENABLED: boolean;
  LOG_LEVEL: string;

  // CORS
  CORS_ORIGINS: string[];
}

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('password'),
  DATABASE_NAME: Joi.string().default('boomscore'),
  DATABASE_SSL: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(false),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .default('your-super-secret-jwt-key-change-in-production-32-chars-minimum'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .default('your-super-secret-refresh-key-change-in-production-32-chars-minimum'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),

  // External APIs
  SPORT_API_KEY: Joi.string().optional(),
  SPORT_API_BASE_URL: Joi.string().default('https://v3.football.api-sports.io'),
  OPENAI_API_KEY: Joi.string().optional(),
  PAYSTACK_SECRET_KEY: Joi.string().optional(),
  PAYSTACK_PUBLIC_KEY: Joi.string().optional(),
  RESEND_API_KEY: Joi.string().optional(),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Features
  SPORTS_SYNC_ENABLED: Joi.boolean().default(true),
  SPORTS_SYNC_INTERVAL: Joi.string().default('0 */30 * * * *'), // Every 30 minutes
  PREDICTIONS_ENABLED: Joi.boolean().default(true),
  CHAT_ENABLED: Joi.boolean().default(true),
  PAYMENTS_ENABLED: Joi.boolean().default(true),

  // Observability
  METRICS_ENABLED: Joi.boolean().default(true),
  TRACING_ENABLED: Joi.boolean().default(true),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:3001,http://localhost:3002'),
});

export default (): Configuration => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 4000,
  API_VERSION: process.env.API_VERSION || 'v1',

  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'postgres',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
  DATABASE_NAME: process.env.DATABASE_NAME || 'boomscore',
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  DATABASE_LOGGING: process.env.DATABASE_LOGGING === 'true',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: parseInt(process.env.REDIS_DB, 10) || 0,

  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',

  SPORT_API_KEY: process.env.SPORT_API_KEY || 'placeholder-sport-api-key',
  SPORT_API_BASE_URL: process.env.SPORT_API_BASE_URL || 'https://v3.football.api-sports.io',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'placeholder-openai-api-key',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'placeholder-paystack-secret-key',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'placeholder-paystack-public-key',
  RESEND_API_KEY: process.env.RESEND_API_KEY || 'placeholder-resend-api-key',

  RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  SPORTS_SYNC_ENABLED: process.env.SPORTS_SYNC_ENABLED !== 'false',
  SPORTS_SYNC_INTERVAL: process.env.SPORTS_SYNC_INTERVAL || '0 */30 * * * *',
  PREDICTIONS_ENABLED: process.env.PREDICTIONS_ENABLED !== 'false',
  CHAT_ENABLED: process.env.CHAT_ENABLED !== 'false',
  PAYMENTS_ENABLED: process.env.PAYMENTS_ENABLED !== 'false',

  METRICS_ENABLED: process.env.METRICS_ENABLED !== 'false',
  TRACING_ENABLED: process.env.TRACING_ENABLED !== 'false',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(
    ',',
  ),
});
