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
  private readonly redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
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
      const [dbStatus, redisStatus] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

      return dbStatus.status === 'up' && redisStatus.status === 'up';
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

      this.logger.error('Redis health check failed', error.stack, {
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
