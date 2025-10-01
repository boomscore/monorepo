/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { LoggerService } from '@/common/services/logger.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly logger: LoggerService,
  ) {}

  @Post('paystack')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ): Promise<{ message: string }> {
    this.logger.info('Received Paystack webhook request', {
      service: 'webhook-controller',
      event: payload?.event,
      hasSignature: !!signature,
    });

    try {
      await this.webhookService.handlePaystackWebhook(payload, signature);

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Webhook processing failed', error.stack, {
        service: 'webhook-controller',
        event: payload?.event,
      });

      // Return 200 to prevent Paystack from retrying invalid webhooks
      return { message: 'Webhook received but processing failed' };
    }
  }

  @Post('paystack/test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(): Promise<{ message: string }> {
    return this.webhookService.testWebhook();
  }
}
