/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { Subscription, SubscriptionPlan, BillingCycle } from '../entities/subscription.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PaystackService } from './paystack.service';
import { LoggerService } from '@/common/services/logger.service';
import { InitiatePaymentInput, PaymentResponse } from '../dto/payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly paystackService: PaystackService,
    private readonly logger: LoggerService,
  ) {}

  async initiatePayment(user: User, input: InitiatePaymentInput): Promise<PaymentResponse> {
    this.logger.info('Initiating payment', {
      service: 'payments',
      userId: user.id,
      plan: input.plan,
      billingCycle: input.billingCycle,
    });

    // Calculate amount based on plan and billing cycle
    const amount = this.calculateAmount(input.plan, input.billingCycle);

    // Create payment record
    const payment = this.paymentRepository.create({
      subscriptionId: undefined, // TODO: Connect to subscription
      paystackReference: `PAY_${Date.now()}_${user.id}`,
      amount,
      currency: 'NGN',
      status: PaymentStatus.PENDING,
      type: PaymentType.SUBSCRIPTION,
      metadata: {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        plan: input.plan,
        billingCycle: input.billingCycle,
      },
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Initialize payment with Paystack
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: user.email,
      amount: amount, // Amount already handled by Paystack service
      reference: savedPayment.paystackReference,
      metadata: {
        paymentId: savedPayment.id,
        plan: input.plan,
        billingCycle: input.billingCycle,
      },
    });

    // Update payment with Paystack reference
    savedPayment.paystackReference = paystackResponse.reference;
    await this.paymentRepository.save(savedPayment);

    return {
      payment: savedPayment,
      paymentUrl: paystackResponse.authorization_url,
      reference: savedPayment.paystackReference,
    };
  }

  async verifyPayment(reference: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paystackReference: reference },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return payment;
    }

    // Verify with Paystack
    const verification = await this.paystackService.verifyTransaction(reference);

    if (verification.paid) {
      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        verificationStatus: verification.status,
        verificationAmount: verification.amount,
      };

      await this.paymentRepository.save(payment);

      // Create or update subscription
      await this.createOrUpdateSubscription(payment);

      this.logger.info('Payment verified successfully', {
        service: 'payments',
        paymentId: payment.id,
        reference,
        amount: payment.amount,
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.failureReason = `Verification failed: ${verification.status}`;
      payment.metadata = {
        ...payment.metadata,
        reason: verification.status,
      };

      await this.paymentRepository.save(payment);

      this.logger.warn('Payment verification failed', {
        service: 'payments',
        paymentId: payment.id,
        reference,
        reason: verification.status,
      });
    }

    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    // TODO: Get payments by subscription.userId since Payment doesn't have direct userId
    return this.paymentRepository.find({
      relations: ['subscription'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  private calculateAmount(plan: SubscriptionPlan, billingCycle: BillingCycle): number {
    const prices = {
      [SubscriptionPlan.PRO]: {
        [BillingCycle.MONTHLY]: 5000, // 50 NGN
        [BillingCycle.YEARLY]: 50000, // 500 NGN (2 months free)
      },
      [SubscriptionPlan.ULTRA]: {
        [BillingCycle.MONTHLY]: 10000, // 100 NGN
        [BillingCycle.YEARLY]: 100000, // 1000 NGN (2 months free)
      },
    };

    if (plan === SubscriptionPlan.FREE) {
      return 0;
    }

    return prices[plan]?.[billingCycle] || 0;
  }

  private async createOrUpdateSubscription(payment: Payment): Promise<void> {
    // TODO: Implement subscription creation/update based on payment
    // This is a placeholder since Payment entity doesn't have direct user/plan properties
    this.logger.info('Payment processed, subscription update needed', {
      service: 'payments',
      paymentId: payment.id,
      amount: payment.amount,
    });
  }

  private async updateUserSubscription(
    userId: string,
    plan: SubscriptionPlan,
    expiresAt: Date,
  ): Promise<void> {
    // This would be handled by the UserService
    // For now, we'll log the intent
    this.logger.info('Should update user subscription', {
      service: 'payments',
      userId,
      plan,
      expiresAt,
    });
  }
}
