/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaymentsService } from './payments.service';
import { SubscriptionService } from './subscription.service';
import { LoggerService } from '@/common/services/logger.service';

export interface WebhookEvent {
  event: string;
  data: any;
}

@Injectable()
export class WebhookService {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly logger: LoggerService,
  ) {}

  async handlePaystackWebhook(payload: any, signature: string): Promise<void> {
    this.logger.info('Received Paystack webhook', {
      service: 'webhook',
      event: payload.event,
      reference: payload.data?.reference,
    });

    // Verify webhook signature
    const isValid = this.paystackService.verifyWebhookSignature(JSON.stringify(payload), signature);

    if (!isValid) {
      this.logger.warn('Invalid webhook signature', {
        service: 'webhook',
        event: payload.event,
      });
      throw new Error('Invalid webhook signature');
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'charge.success':
        await this.handleChargeSuccess(payload.data);
        break;

      case 'charge.failed':
        await this.handleChargeFailed(payload.data);
        break;

      case 'subscription.create':
        await this.handleSubscriptionCreate(payload.data);
        break;

      case 'subscription.disable':
        await this.handleSubscriptionDisable(payload.data);
        break;

      case 'subscription.enable':
        await this.handleSubscriptionEnable(payload.data);
        break;

      case 'invoice.create':
        await this.handleInvoiceCreate(payload.data);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(payload.data);
        break;

      default:
        this.logger.info('Unhandled webhook event', {
          service: 'webhook',
          event: payload.event,
        });
    }
  }

  private async handleChargeSuccess(data: any): Promise<void> {
    try {
      const reference = data.reference;

      this.logger.info('Processing successful charge', {
        service: 'webhook',
        reference,
        amount: data.amount,
      });

      // Verify and update payment
      await this.paymentsService.verifyPayment(reference);
    } catch (error) {
      this.logger.error('Failed to handle charge success', error.stack, {
        service: 'webhook',
        reference: data.reference,
      });
    }
  }

  private async handleChargeFailed(data: any): Promise<void> {
    try {
      const reference = data.reference;

      this.logger.warn('Processing failed charge', {
        service: 'webhook',
        reference,
        reason: data.gateway_response,
      });

      // Update payment status to failed
      // This would be handled by the PaymentsService
    } catch (error) {
      this.logger.error('Failed to handle charge failure', error.stack, {
        service: 'webhook',
        reference: data.reference,
      });
    }
  }

  private async handleSubscriptionCreate(data: any): Promise<void> {
    try {
      this.logger.info('Processing subscription creation', {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
        customerCode: data.customer.customer_code,
      });

      // Handle subscription creation
      // This might involve creating a local subscription record
    } catch (error) {
      this.logger.error('Failed to handle subscription creation', error.stack, {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
      });
    }
  }

  private async handleSubscriptionDisable(data: any): Promise<void> {
    try {
      this.logger.info('Processing subscription disable', {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
      });

      // Handle subscription cancellation/disable
      // This would involve updating the subscription status
    } catch (error) {
      this.logger.error('Failed to handle subscription disable', error.stack, {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
      });
    }
  }

  private async handleSubscriptionEnable(data: any): Promise<void> {
    try {
      this.logger.info('Processing subscription enable', {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
      });

      // Handle subscription reactivation
    } catch (error) {
      this.logger.error('Failed to handle subscription enable', error.stack, {
        service: 'webhook',
        subscriptionCode: data.subscription_code,
      });
    }
  }

  private async handleInvoiceCreate(data: any): Promise<void> {
    try {
      this.logger.info('Processing invoice creation', {
        service: 'webhook',
        invoiceCode: data.invoice_code,
        amount: data.amount,
      });

      // Handle invoice creation for subscriptions
    } catch (error) {
      this.logger.error('Failed to handle invoice creation', error.stack, {
        service: 'webhook',
        invoiceCode: data.invoice_code,
      });
    }
  }

  private async handleInvoicePaymentFailed(data: any): Promise<void> {
    try {
      this.logger.warn('Processing invoice payment failure', {
        service: 'webhook',
        invoiceCode: data.invoice_code,
        reason: data.description,
      });

      // Handle failed invoice payment
      // This might involve notifying the user or updating subscription status
    } catch (error) {
      this.logger.error('Failed to handle invoice payment failure', error.stack, {
        service: 'webhook',
        invoiceCode: data.invoice_code,
      });
    }
  }

  async testWebhook(): Promise<{ message: string }> {
    this.logger.info('Webhook test endpoint called', {
      service: 'webhook',
    });

    return { message: 'Webhook endpoint is working' };
  }
}
