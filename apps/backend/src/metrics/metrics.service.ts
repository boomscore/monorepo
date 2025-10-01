/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: client.Registry;
  
  // HTTP metrics
  private readonly httpRequestsTotal: client.Counter<string>;
  private readonly httpRequestDuration: client.Histogram<string>;
  
  // GraphQL metrics
  private readonly graphqlRequestsTotal: client.Counter<string>;
  private readonly graphqlRequestDuration: client.Histogram<string>;
  private readonly graphqlResolverDuration: client.Histogram<string>;
  
  // Database metrics
  private readonly databaseConnections: client.Gauge<string>;
  private readonly databaseQueryDuration: client.Histogram<string>;
  
  // Business metrics
  private readonly activeUsers: client.Gauge<string>;
  private readonly predictionsGenerated: client.Counter<string>;
  private readonly chatMessagesTotal: client.Counter<string>;
  private readonly paymentsProcessed: client.Counter<string>;
  
  // System metrics
  private readonly memoryUsage: client.Gauge<string>;
  private readonly cpuUsage: client.Gauge<string>;

  constructor(private readonly configService: ConfigService) {
    this.register = new client.Registry();
    
    // Collect default metrics (process metrics)
    client.collectDefaultMetrics({
      register: this.register,
      prefix: 'sports_platform_',
    });

    // HTTP metrics
    this.httpRequestsTotal = new client.Counter({
      name: 'sports_platform_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new client.Histogram({
      name: 'sports_platform_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    // GraphQL metrics
    this.graphqlRequestsTotal = new client.Counter({
      name: 'sports_platform_graphql_requests_total',
      help: 'Total number of GraphQL requests',
      labelNames: ['operation_type', 'operation_name'],
      registers: [this.register],
    });

    this.graphqlRequestDuration = new client.Histogram({
      name: 'sports_platform_graphql_request_duration_seconds',
      help: 'GraphQL request duration in seconds',
      labelNames: ['operation_type', 'operation_name'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    this.graphqlResolverDuration = new client.Histogram({
      name: 'sports_platform_graphql_resolver_duration_seconds',
      help: 'GraphQL resolver duration in seconds',
      labelNames: ['parent_type', 'field_name'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
      registers: [this.register],
    });

    // Database metrics
    this.databaseConnections = new client.Gauge({
      name: 'sports_platform_database_connections',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    this.databaseQueryDuration = new client.Histogram({
      name: 'sports_platform_database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
      registers: [this.register],
    });

    // Business metrics
    this.activeUsers = new client.Gauge({
      name: 'sports_platform_active_users',
      help: 'Number of active users',
      registers: [this.register],
    });

    this.predictionsGenerated = new client.Counter({
      name: 'sports_platform_predictions_generated_total',
      help: 'Total number of predictions generated',
      labelNames: ['type', 'user_tier'],
      registers: [this.register],
    });

    this.chatMessagesTotal = new client.Counter({
      name: 'sports_platform_chat_messages_total',
      help: 'Total number of chat messages',
      labelNames: ['type'],
      registers: [this.register],
    });

    this.paymentsProcessed = new client.Counter({
      name: 'sports_platform_payments_processed_total',
      help: 'Total number of payments processed',
      labelNames: ['status', 'plan'],
      registers: [this.register],
    });

    // System metrics
    this.memoryUsage = new client.Gauge({
      name: 'sports_platform_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register],
    });

    this.cpuUsage = new client.Gauge({
      name: 'sports_platform_cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.register],
    });
  }

  async onModuleInit() {
    // Start collecting custom metrics periodically
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // HTTP metrics methods
  incrementHttpRequests(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  recordHttpRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration / 1000); // Convert to seconds
  }

  // GraphQL metrics methods
  incrementGraphQLRequests(operationType: string, operationName: string): void {
    this.graphqlRequestsTotal
      .labels(operationType, operationName || 'unknown')
      .inc();
  }

  recordGraphQLRequestDuration(operationType: string, operationName: string, duration: number): void {
    this.graphqlRequestDuration
      .labels(operationType, operationName || 'unknown')
      .observe(duration / 1000);
  }

  recordGraphQLResolverDuration(parentType: string, fieldName: string, duration: number): void {
    this.graphqlResolverDuration
      .labels(parentType, fieldName)
      .observe(duration / 1000);
  }

  // Database metrics methods
  setDatabaseConnections(count: number): void {
    this.databaseConnections.set(count);
  }

  recordDatabaseQueryDuration(operation: string, duration: number): void {
    this.databaseQueryDuration
      .labels(operation)
      .observe(duration / 1000);
  }

  // Business metrics methods
  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  incrementPredictionsGenerated(type: string, userTier: string): void {
    this.predictionsGenerated
      .labels(type, userTier)
      .inc();
  }

  incrementChatMessages(type: string): void {
    this.chatMessagesTotal
      .labels(type)
      .inc();
  }

  incrementPaymentsProcessed(status: string, plan: string): void {
    this.paymentsProcessed
      .labels(status, plan)
      .inc();
  }

  private updateSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    
    this.memoryUsage.labels('rss').set(memUsage.rss);
    this.memoryUsage.labels('heap_used').set(memUsage.heapUsed);
    this.memoryUsage.labels('heap_total').set(memUsage.heapTotal);
    this.memoryUsage.labels('external').set(memUsage.external);

    // CPU usage (simplified - in production you might want to use a proper CPU monitoring library)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    this.cpuUsage.set(cpuPercent);
  }
}
