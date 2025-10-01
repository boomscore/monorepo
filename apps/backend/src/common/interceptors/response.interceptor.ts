/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<string>();
    const startTime = Date.now();
    
    // Generate request ID if not present
    const requestId = this.getOrCreateRequestId(context);
    
    // Set context for logger
    this.logger.setContext({ requestId });

    if (contextType === 'graphql') {
      return this.handleGraphQLRequest(context, next, startTime, requestId);
    }

    return this.handleHttpRequest(context, next, startTime, requestId);
  }

  private handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
    startTime: number,
    requestId: string,
  ): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);
    request.requestId = requestId;

    // Log incoming request
    this.logger.logRequest(request, { requestId });

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        
        // Log outgoing response
        this.logger.logResponse(request, response, responseTime, { requestId });
        
        // Log performance metrics
        this.logger.logMetric('http_request_duration', responseTime, 'ms', {
          requestId,
          method: request.method,
          route: request.route?.path,
          statusCode: response.statusCode,
        });
      }),
    );
  }

  private handleGraphQLRequest(
    context: ExecutionContext,
    next: CallHandler,
    startTime: number,
    requestId: string,
  ): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const args = gqlContext.getArgs();
    const req = gqlContext.getContext().req;

    if (req) {
      req.requestId = requestId;
    }

    // Log GraphQL operation
    this.logger.logGraphQLOperation(
      info.operation.operation,
      info.operation.loc?.source.body || '',
      args,
      { requestId }
    );

    return next.handle().pipe(
      tap((result) => {
        const responseTime = Date.now() - startTime;
        
        // Log GraphQL response metrics
        this.logger.logMetric('graphql_request_duration', responseTime, 'ms', {
          requestId,
          operationType: info.operation.operation,
          operationName: info.operation.name?.value,
          fieldName: info.fieldName,
          parentType: info.parentType.name,
        });

        // Log successful GraphQL operation
        this.logger.info({
          type: 'graphql_response',
          operationType: info.operation.operation,
          operationName: info.operation.name?.value,
          fieldName: info.fieldName,
          responseTime: `${responseTime}ms`,
          hasErrors: result?.errors ? result.errors.length : 0,
        }, { requestId });
      }),
    );
  }

  private getOrCreateRequestId(context: ExecutionContext): string {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const req = gqlContext.getContext().req;
      
      if (req) {
        return req.headers['x-request-id'] || req.requestId || uuidv4();
      }
      
      return uuidv4();
    }

    const request = context.switchToHttp().getRequest();
    return request.headers['x-request-id'] || request.requestId || uuidv4();
  }
}
