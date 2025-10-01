/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/common/services/logger.service';
import { MetricsService } from '@/metrics/metrics.service';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as crypto from 'crypto';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees_breakdown: any;
    log: any;
    fees: number;
    customer: any;
    authorization: any;
    plan: any;
  };
}

interface PaystackCustomer {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: any;
}

interface PaystackInitializePayment {
  email: string;
  amount: number; // Amount in kobo (1 NGN = 100 kobo)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: any;
  channels?: string[];
  plan?: string;
  invoice_limit?: number;
  customer?: PaystackCustomer;
}

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    this.publicKey = this.configService.get<string>('PAYSTACK_PUBLIC_KEY');

    if (!this.secretKey || !this.publicKey) {
      throw new Error('Paystack credentials are required');
    }
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const config: AxiosRequestConfig = {
        url: `${this.baseUrl}${endpoint}`,
        method,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        data,
        timeout: 30000,
      };

      const response: AxiosResponse<T> = await firstValueFrom(this.httpService.request(config));

      const duration = Date.now() - startTime;

      this.logger.info('Paystack API request successful', {
        service: 'paystack',
        method,
        endpoint,
        duration: `${duration}ms`,
        status: response.status,
      });

      this.metricsService.recordDatabaseQueryDuration('paystack-request', duration);

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Paystack API request failed', error.stack, {
        service: 'paystack',
        method,
        endpoint,
        duration: `${duration}ms`,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      throw error;
    }
  }

  async initializePayment(params: PaystackInitializePayment): Promise<PaystackInitializeResponse> {
    // Generate reference if not provided
    if (!params.reference) {
      params.reference = this.generateReference();
    }

    const response = await this.makeRequest<PaystackInitializeResponse>(
      'POST',
      '/transaction/initialize',
      params,
    );

    this.logger.info('Payment initialized', {
      service: 'paystack',
      reference: params.reference,
      amount: params.amount,
      email: params.email,
    });

    return response;
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    const response = await this.makeRequest<PaystackVerifyResponse>(
      'GET',
      `/transaction/verify/${reference}`,
    );

    this.logger.info('Payment verified', {
      service: 'paystack',
      reference,
      status: response.data.status,
      amount: response.data.amount,
    });

    return response;
  }

  async createCustomer(customer: PaystackCustomer): Promise<any> {
    const response = await this.makeRequest('POST', '/customer', customer);

    this.logger.info('Customer created', {
      service: 'paystack',
      email: customer.email,
    });

    return response;
  }

  async createPlan(params: {
    name: string;
    interval: 'daily' | 'weekly' | 'monthly' | 'biannually' | 'annually';
    amount: number;
    currency?: string;
    description?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    invoice_limit?: number;
  }): Promise<any> {
    const response = await this.makeRequest('POST', '/plan', {
      currency: 'NGN',
      ...params,
    });

    this.logger.info('Subscription plan created', {
      service: 'paystack',
      name: params.name,
      interval: params.interval,
      amount: params.amount,
    });

    return response;
  }

  async createSubscription(params: {
    customer: string; // Customer code or email
    plan: string; // Plan code
    authorization?: string;
    start_date?: string;
  }): Promise<any> {
    const response = await this.makeRequest('POST', '/subscription', params);

    this.logger.info('Subscription created', {
      service: 'paystack',
      customer: params.customer,
      plan: params.plan,
    });

    return response;
  }

  async disableSubscription(code: string, token: string): Promise<any> {
    const response = await this.makeRequest('POST', '/subscription/disable', { code, token });

    this.logger.info('Subscription disabled', {
      service: 'paystack',
      code,
    });

    return response;
  }

  async enableSubscription(code: string, token: string): Promise<any> {
    const response = await this.makeRequest('POST', '/subscription/enable', { code, token });

    this.logger.info('Subscription enabled', {
      service: 'paystack',
      code,
    });

    return response;
  }

  async getSubscription(idOrCode: string): Promise<any> {
    const response = await this.makeRequest('GET', `/subscription/${idOrCode}`);

    return response;
  }

  async listTransactions(
    params: {
      perPage?: number;
      page?: number;
      customer?: string;
      status?: string;
      from?: string;
      to?: string;
      amount?: number;
    } = {},
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.makeRequest('GET', `/transaction?${queryParams.toString()}`);

    return response;
  }

  async refundTransaction(transaction: string, amount?: number): Promise<any> {
    const response = await this.makeRequest('POST', '/refund', {
      transaction,
      amount,
    });

    this.logger.info('Transaction refunded', {
      service: 'paystack',
      transaction,
      amount,
    });

    return response;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto.createHmac('sha512', this.secretKey).update(payload, 'utf-8').digest('hex');

    return hash === signature;
  }

  generateReference(prefix = 'TXN'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  // Convert amount from Naira to Kobo (Paystack uses kobo)
  toKobo(amountInNaira: number): number {
    return Math.round(amountInNaira * 100);
  }

  // Convert amount from Kobo to Naira
  fromKobo(amountInKobo: number): number {
    return amountInKobo / 100;
  }

  // Helper method to get payment channels based on amount
  getRecommendedChannels(amount: number): string[] {
    const amountInNaira = this.fromKobo(amount);

    if (amountInNaira >= 500000) {
      // For large amounts, prefer bank transfer
      return ['bank', 'bank_transfer', 'card'];
    } else if (amountInNaira >= 50000) {
      // For medium amounts, include USSD
      return ['card', 'bank', 'ussd', 'bank_transfer'];
    } else {
      // For small amounts, all channels
      return ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'];
    }
  }

  // Get supported Nigerian banks
  async getBanks(): Promise<any> {
    const response = await this.makeRequest('GET', '/bank?country=nigeria');

    return response;
  }

  // Resolve account number to get account details
  async resolveAccount(params: { account_number: string; bank_code: string }): Promise<any> {
    const response = await this.makeRequest(
      'GET',
      `/bank/resolve?account_number=${params.account_number}&bank_code=${params.bank_code}`,
    );

    return response;
  }

  // Create transfer recipient
  async createTransferRecipient(params: {
    type: 'nuban';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }): Promise<any> {
    const response = await this.makeRequest('POST', '/transferrecipient', {
      currency: 'NGN',
      ...params,
    });

    return response;
  }

  // Initiate transfer
  async initiateTransfer(params: {
    source: 'balance';
    amount: number;
    recipient: string;
    reason?: string;
    reference?: string;
  }): Promise<any> {
    if (!params.reference) {
      params.reference = this.generateReference('TRF');
    }

    const response = await this.makeRequest('POST', '/transfer', params);

    this.logger.info('Transfer initiated', {
      service: 'paystack',
      reference: params.reference,
      amount: params.amount,
      recipient: params.recipient,
    });

    return response;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('GET', '/bank?country=nigeria&perPage=1');
      return true;
    } catch (error) {
      this.logger.error('Paystack health check failed', error.stack);
      return false;
    }
  }

  // Missing methods for PaymentsService
  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    metadata?: any;
  }): Promise<{ reference: string; authorization_url: string }> {
    try {
      const response = await this.makeRequest<PaystackInitializeResponse>(
        'POST',
        '/transaction/initialize',
        {
          email: data.email,
          amount: data.amount * 100, // Convert to kobo
          reference: data.reference,
          metadata: data.metadata,
        },
      );

      return {
        reference: response.data.reference,
        authorization_url: response.data.authorization_url,
      };
    } catch (error) {
      this.logger.error('Failed to initialize Paystack transaction', error.stack, {
        service: 'paystack',
        reference: data.reference,
      });
      throw error;
    }
  }

  async verifyTransaction(reference: string): Promise<{
    status: string;
    amount: number;
    paid: boolean;
  }> {
    try {
      const response = await this.makeRequest<PaystackVerifyResponse>(
        'GET',
        `/transaction/verify/${reference}`,
      );

      return {
        status: response.data.status,
        amount: response.data.amount / 100, // Convert from kobo
        paid: response.data.status === 'success',
      };
    } catch (error) {
      this.logger.error('Failed to verify Paystack transaction', error.stack, {
        service: 'paystack',
        reference,
      });
      throw error;
    }
  }
}
