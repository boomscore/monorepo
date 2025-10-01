/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
  BillingCycle,
  SubscriptionPlan,
} from '../entities/subscription.entity';
import { User } from '@/modules/users/entities/user.entity';
import { LoggerService } from '@/common/services/logger.service';
import { PaystackService } from './paystack.service';
import { CreateSubscriptionInput } from '../dto/payments.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paystackService: PaystackService,
    private readonly logger: LoggerService,
  ) {}

  async createSubscription(user: User, input: CreateSubscriptionInput): Promise<Subscription> {
    this.logger.info('Creating subscription', {
      service: 'subscription',
      userId: user.id,
      plan: input.plan,
      billingCycle: input.billingCycle,
    });

    // Check if user already has an active subscription
    const existingSubscription = await this.getActiveSubscription(user.id);
    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    const now = new Date();
    const periodEnd = new Date(now);

    if (input.billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = this.subscriptionRepository.create({
      userId: user.id,
      plan: input.plan,
      billingCycle: input.billingCycle,
      status: SubscriptionStatus.ACTIVE,
      // TODO: Add currentPeriodStart and currentPeriodEnd to entity
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['user'],
    });
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    Object.assign(subscription, updates);
    subscription.updatedAt = new Date();

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('Subscription is not active');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.updatedAt = new Date();

    await this.subscriptionRepository.save(subscription);

    // Update user's subscription plan to FREE
    await this.userRepository.update(userId, {
      subscriptionPlan: SubscriptionPlan.FREE,
      subscriptionExpiresAt: null,
    });

    this.logger.info('Subscription cancelled', {
      service: 'subscription',
      subscriptionId,
      userId,
    });

    return subscription;
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = new Date();
    const newPeriodEnd = new Date(subscription.currentPeriodEnd);

    if (subscription.billingCycle === BillingCycle.MONTHLY) {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    } else {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    }

    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = newPeriodEnd;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.updatedAt = now;

    return this.subscriptionRepository.save(subscription);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const now = new Date();

    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['user'],
    });

    const expired = expiredSubscriptions.filter(sub => sub.currentPeriodEnd < now);

    for (const subscription of expired) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription.updatedAt = now;

      await this.subscriptionRepository.save(subscription);

      // Update user to FREE plan
      await this.userRepository.update(subscription.userId, {
        subscriptionPlan: SubscriptionPlan.FREE,
        subscriptionExpiresAt: null,
      });

      this.logger.info('Subscription expired', {
        service: 'subscription',
        subscriptionId: subscription.id,
        userId: subscription.userId,
      });
    }

    if (expired.length > 0) {
      this.logger.info(`Processed ${expired.length} expired subscriptions`);
    }
  }

  async getSubscriptionStats() {
    const stats = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select(['COUNT(*) as total', 'subscription.plan as plan', 'subscription.status as status'])
      .groupBy('subscription.plan, subscription.status')
      .getRawMany();

    return stats.map(stat => ({
      plan: stat.plan,
      status: stat.status,
      count: parseInt(stat.total),
    }));
  }

  async isSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);

    if (!subscription) {
      return false;
    }

    return subscription.currentPeriodEnd > new Date();
  }

  async getSubscriptionLimits(userId: string) {
    const subscription = await this.getActiveSubscription(userId);

    const limits = {
      [SubscriptionPlan.FREE]: {
        monthlyPredictions: 10,
        monthlyChatMessages: 50,
        advancedFeatures: false,
      },
      [SubscriptionPlan.PRO]: {
        monthlyPredictions: 100,
        monthlyChatMessages: 500,
        advancedFeatures: true,
      },
      [SubscriptionPlan.ULTRA]: {
        monthlyPredictions: -1, // Unlimited
        monthlyChatMessages: -1, // Unlimited
        advancedFeatures: true,
      },
    };

    const plan = subscription?.plan || SubscriptionPlan.FREE;
    return limits[plan];
  }
}
