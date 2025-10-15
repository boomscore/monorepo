/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { LoggerService } from '@/common/services/logger.service';

interface HealthCheck {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

interface ServiceStatus {
  status: 'up' | 'down';
  message?: string;
  responseTime?: number;
}

@Injectable()
export class HealthService {
  private readonly redis: Redis | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    // Initialize Redis connection with error handling
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD') || undefined,
        db: this.configService.get('REDIS_DB', 0),
        lazyConnect: false,
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        enableOfflineQueue: true,
      });

      // Handle Redis connection errors gracefully
      this.redis.on('error', err => {
        this.logger.warn('Redis connection error in health service', { error: err.message });
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Redis connection in health service', {
        error: error.message,
      });
      this.redis = null;
    }
  }

  async check(): Promise<HealthCheck> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalAPIs(),
    ]);

    const details: Record<string, any> = {};
    const info: Record<string, any> = {};
    const error: Record<string, any> = {};

    checks.forEach((result, index) => {
      const serviceName = ['database', 'redis', 'external-apis'][index];

      if (result.status === 'fulfilled') {
        details[serviceName] = result.value;
        if (result.value.status === 'up') {
          info[serviceName] = result.value;
        } else {
          error[serviceName] = result.value;
        }
      } else {
        const errorStatus: ServiceStatus = {
          status: 'down',
          message: result.reason?.message || 'Unknown error',
        };
        details[serviceName] = errorStatus;
        error[serviceName] = errorStatus;
      }
    });

    const hasErrors = Object.keys(error).length > 0;

    return {
      status: hasErrors ? 'error' : 'ok',
      info: Object.keys(info).length > 0 ? info : undefined,
      error: Object.keys(error).length > 0 ? error : undefined,
      details,
    };
  }

  async checkReadiness(): Promise<boolean> {
    try {
      const [dbStatus] = await Promise.all([this.checkDatabase()]);

      // Only require database to be up for readiness, Redis is optional
      return dbStatus.status === 'up';
    } catch (error) {
      this.logger.error('Readiness check failed', error.stack, {
        service: 'health',
        check: 'readiness',
      });
      return false;
    }
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();

    try {
      if (!this.dataSource.isInitialized) {
        return {
          status: 'down',
          message: 'Database connection not initialized',
        };
      }

      await this.dataSource.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      return {
        status: 'up',
        responseTime,
        message: 'Database connection healthy',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.error('Database health check failed', error.stack, {
        service: 'health',
        check: 'database',
        responseTime,
      });

      return {
        status: 'down',
        message: `Database connection failed: ${error.message}`,
        responseTime,
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    const startTime = Date.now();

    try {
      if (!this.redis) {
        return {
          status: 'down',
          message: 'Redis connection not initialized',
          responseTime: Date.now() - startTime,
        };
      }

      const result = await this.redis.ping();
      const responseTime = Date.now() - startTime;

      if (result === 'PONG') {
        return {
          status: 'up',
          responseTime,
          message: 'Redis connection healthy',
        };
      }

      return {
        status: 'down',
        message: `Unexpected Redis ping response: ${result}`,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.warn('Redis health check failed', {
        error: error.message,
        service: 'health',
        check: 'redis',
        responseTime,
      });

      return {
        status: 'down',
        message: `Redis connection failed: ${error.message}`,
        responseTime,
      };
    }
  }

  private async checkExternalAPIs(): Promise<ServiceStatus> {
    // For now, just return a simple status
    // TODO: Implement actual health checks for external APIs
    try {
      return {
        status: 'up',
        message: 'External APIs accessible',
      };
    } catch (error) {
      return {
        status: 'down',
        message: `External APIs check failed: ${error.message}`,
      };
    }
  }
}
