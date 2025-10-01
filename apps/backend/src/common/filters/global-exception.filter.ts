/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { Response } from 'express';
import { LoggerService } from '@/common/services/logger.service';
import { GraphQLError } from 'graphql';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): any {
    const contextType = host.getType<string>();

    if (contextType === 'graphql') {
      return this.handleGraphQLException(exception, host);
    }

    return this.handleHttpException(exception, host);
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const { statusCode, message, error } = this.getErrorInfo(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    };

    // Log the error
    this.logger.logError(exception instanceof Error ? exception : new Error(String(exception)), {
      requestId: request.requestId,
      userId: request.user?.id,
      url: request.url,
      method: request.method,
      statusCode,
    });

    response.status(statusCode).json(errorResponse);
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    const { message, code, statusCode } = this.getGraphQLErrorInfo(exception);

    // Log the error
    this.logger.logError(exception instanceof Error ? exception : new Error(String(exception)), {
      requestId: context.req?.requestId,
      userId: context.req?.user?.id,
      operationName: context.req?.body?.operationName,
      type: 'graphql_error',
      statusCode,
    });

    return new GraphQLError(message, {
      extensions: {
        code,
        statusCode,
        timestamp: new Date().toISOString(),
        requestId: context.req?.requestId,
      },
    });
  }

  private getErrorInfo(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const statusCode = exception.getStatus();

      if (typeof response === 'object' && response !== null) {
        const errorResponse = response as any;
        return {
          statusCode,
          message: errorResponse.message || exception.message,
          error: errorResponse.error || exception.name,
        };
      }

      return {
        statusCode,
        message: exception.message,
        error: exception.name,
      };
    }

    if (exception instanceof Error) {
      // Handle specific error types
      if (exception.name === 'ValidationError') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: exception.message,
          error: 'Validation Failed',
        };
      }

      if (exception.name === 'UnauthorizedError' || exception.message.includes('unauthorized')) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized access',
          error: 'Unauthorized',
        };
      }

      if (exception.name === 'ForbiddenError' || exception.message.includes('forbidden')) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access forbidden',
          error: 'Forbidden',
        };
      }

      if (exception.name === 'NotFoundError' || exception.message.includes('not found')) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
        };
      }

      if (exception.name === 'QueryFailedError') {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          error: 'Database Error',
        };
      }

      if (exception.name === 'RateLimitError') {
        return {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
        };
      }
    }

    // Default error response
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private getGraphQLErrorInfo(exception: unknown): {
    message: string;
    code: string;
    statusCode: number;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      return {
        message: exception.message,
        code: this.getGraphQLErrorCode(statusCode),
        statusCode,
      };
    }

    if (exception instanceof Error) {
      // Map specific error types to GraphQL error codes
      if (exception.name === 'ValidationError') {
        return {
          message: exception.message,
          code: 'BAD_USER_INPUT',
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      if (exception.name === 'UnauthorizedError' || exception.message.includes('unauthorized')) {
        return {
          message: 'You must be authenticated to access this resource',
          code: 'UNAUTHENTICATED',
          statusCode: HttpStatus.UNAUTHORIZED,
        };
      }

      if (exception.name === 'ForbiddenError' || exception.message.includes('forbidden')) {
        return {
          message: 'You do not have permission to access this resource',
          code: 'FORBIDDEN',
          statusCode: HttpStatus.FORBIDDEN,
        };
      }

      if (exception.name === 'NotFoundError' || exception.message.includes('not found')) {
        return {
          message: 'The requested resource was not found',
          code: 'NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      if (exception.name === 'RateLimitError') {
        return {
          message: 'Rate limit exceeded. Please try again later',
          code: 'RATE_LIMITED',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        };
      }

      if (exception.name === 'PaymentRequiredError') {
        return {
          message: 'Payment required to access this feature',
          code: 'PAYMENT_REQUIRED',
          statusCode: HttpStatus.PAYMENT_REQUIRED,
        };
      }
    }

    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private getGraphQLErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_USER_INPUT';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHENTICATED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      case HttpStatus.PAYMENT_REQUIRED:
        return 'PAYMENT_REQUIRED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
