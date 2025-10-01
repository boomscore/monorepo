/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

interface LogContext {
  requestId?: string;
  userId?: string;
  module?: string;
  method?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;
  private readonly asyncLocalStorage = new AsyncLocalStorage<LogContext>();

  constructor(private readonly configService: ConfigService) {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    
    this.logger = pino({
      level: this.configService.get('LOG_LEVEL', 'info'),
      transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          'password',
          'token',
          'accessToken',
          'refreshToken',
          'authorization',
          'cookie',
          'apiKey',
          'secret',
          '*.password',
          '*.token',
          '*.apiKey',
          '*.secret',
        ],
        censor: '[REDACTED]',
      },
    });
  }

  setContext(context: LogContext): void {
    this.asyncLocalStorage.enterWith({
      ...this.asyncLocalStorage.getStore(),
      ...context,
    });
  }

  getContext(): LogContext {
    return this.asyncLocalStorage.getStore() || {};
  }

  private formatMessage(message: any, context?: LogContext): object {
    const store = this.getContext();
    const mergedContext = { ...store, ...context };

    if (typeof message === 'string') {
      return {
        message,
        ...mergedContext,
      };
    }

    if (typeof message === 'object' && message !== null) {
      return {
        ...message,
        ...mergedContext,
      };
    }

    return {
      message: String(message),
      ...mergedContext,
    };
  }

  log(message: any, context?: LogContext): void {
    this.logger.info(this.formatMessage(message, context));
  }

  error(message: any, trace?: string, context?: LogContext): void {
    this.logger.error({
      ...this.formatMessage(message, context),
      trace,
    });
  }

  warn(message: any, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: any, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: any, context?: LogContext): void {
    this.logger.trace(this.formatMessage(message, context));
  }

  info(message: any, context?: LogContext): void {
    this.logger.info(this.formatMessage(message, context));
  }

  // Custom methods for structured logging
  logRequest(req: any, context?: LogContext): void {
    this.info({
      type: 'http_request',
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      ...context,
    });
  }

  logResponse(req: any, res: any, responseTime: number, context?: LogContext): void {
    this.info({
      type: 'http_response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...context,
    });
  }

  logGraphQLOperation(operationName: string, query: string, variables: any, context?: LogContext): void {
    this.info({
      type: 'graphql_operation',
      operationName,
      query: query.replace(/\s+/g, ' ').trim(),
      variables: this.sanitizeVariables(variables),
      ...context,
    });
  }

  logError(error: Error, context?: LogContext): void {
    this.error({
      type: 'error',
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  logMetric(name: string, value: number, unit?: string, context?: LogContext): void {
    this.info({
      type: 'metric',
      metricName: name,
      metricValue: value,
      metricUnit: unit,
      ...context,
    });
  }

  private sanitizeVariables(variables: any): any {
    if (!variables) return variables;
    
    const sanitized = { ...variables };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
    
    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
