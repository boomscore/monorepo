/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '@/modules/users/entities/user.entity';
import { Payment } from './payment.entity';

// Define subscription plan enum locally
export enum SubscriptionPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ULTRA = 'ULTRA',
}

// Register enums with GraphQL
registerEnumType(SubscriptionPlan, {
  name: 'SubscriptionPlan',
  description: 'Available subscription plans',
});

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  TRIALING = 'TRIALING',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

registerEnumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
  description: 'Status of the subscription',
});

registerEnumType(BillingCycle, {
  name: 'BillingCycle',
  description: 'Billing cycle for the subscription',
});

@Entity('subscriptions')
@ObjectType()
@Index(['userId'], { unique: true })
@Index(['status'])
@Index(['plan'])
@Index(['expiresAt'])
@Index(['paystackSubscriptionId'], { unique: true })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  @Field(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  @Field(() => BillingCycle)
  billingCycle: BillingCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field(() => Float)
  amount: number; // Amount in Naira

  @Column({ length: 10, default: 'NGN' })
  @Field()
  currency: string;

  @Column({ type: 'timestamp' })
  @Field()
  startDate: Date;

  @Column({ type: 'timestamp' })
  @Field()
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  trialEndsAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  nextBillingAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  currentPeriodStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  currentPeriodEnd?: Date;

  @Column({ length: 255, nullable: true })
  paystackSubscriptionId?: string; // Paystack subscription ID

  @Column({ length: 255, nullable: true })
  paystackCustomerId?: string; // Paystack customer ID

  @Column({ length: 255, nullable: true })
  paystackPlanId?: string; // Paystack plan ID

  @Column({ type: 'boolean', default: true })
  @Field()
  autoRenew: boolean;

  @Column({ type: 'int', default: 0 })
  @Field()
  failedPaymentAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastPaymentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastFailedPaymentAt?: Date;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  cancellationReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  features?: {
    predictionsPerMonth: number;
    chatMessagesPerMonth: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customPrompts: boolean;
    bulkPredictions: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  usage?: {
    currentPredictions: number;
    currentChatMessages: number;
    lastResetAt: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.subscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @OneToMany(() => Payment, payment => payment.subscription)
  @Field(() => [Payment])
  payments: Payment[];

  // Helper methods
  @Field()
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && this.expiresAt > new Date();
  }

  @Field()
  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  @Field()
  get isCancelled(): boolean {
    return this.status === SubscriptionStatus.CANCELLED;
  }

  @Field()
  get isTrialing(): boolean {
    return (
      this.status === SubscriptionStatus.TRIALING &&
      this.trialEndsAt &&
      this.trialEndsAt > new Date()
    );
  }

  @Field()
  get daysUntilExpiry(): number {
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  @Field()
  get daysUntilTrialEnd(): number {
    if (!this.trialEndsAt) return 0;
    const now = new Date();
    const diff = this.trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  @Field(() => Float)
  get monthlyAmount(): number {
    switch (this.billingCycle) {
      case BillingCycle.MONTHLY:
        return this.amount;
      case BillingCycle.QUARTERLY:
        return this.amount / 3;
      case BillingCycle.YEARLY:
        return this.amount / 12;
      default:
        return this.amount;
    }
  }

  @Field()
  get displayName(): string {
    const cycle = this.billingCycle.toLowerCase();
    return `${this.plan} - ${cycle} (₦${this.amount.toLocaleString()})`;
  }

  @Field()
  get canUseFeature(): boolean {
    return this.isActive || this.isTrialing;
  }

  activate(): void {
    this.status = SubscriptionStatus.ACTIVE;
    this.failedPaymentAttempts = 0;
  }

  cancel(reason?: string): void {
    this.status = SubscriptionStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    this.autoRenew = false;
  }

  suspend(): void {
    this.status = SubscriptionStatus.SUSPENDED;
  }

  expire(): void {
    this.status = SubscriptionStatus.EXPIRED;
  }

  recordPaymentSuccess(): void {
    this.lastPaymentAt = new Date();
    this.failedPaymentAttempts = 0;

    // Extend subscription based on billing cycle
    const now = new Date();
    switch (this.billingCycle) {
      case BillingCycle.MONTHLY:
        this.expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        this.nextBillingAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case BillingCycle.QUARTERLY:
        this.expiresAt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        this.nextBillingAt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        break;
      case BillingCycle.YEARLY:
        this.expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        this.nextBillingAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        break;
    }

    if (this.status !== SubscriptionStatus.ACTIVE) {
      this.activate();
    }
  }

  recordPaymentFailure(): void {
    this.lastFailedPaymentAt = new Date();
    this.failedPaymentAttempts += 1;

    // Suspend after 3 failed attempts
    if (this.failedPaymentAttempts >= 3) {
      this.suspend();
    }
  }

  resetUsage(): void {
    const features = this.getFeatures();
    this.usage = {
      currentPredictions: 0,
      currentChatMessages: 0,
      lastResetAt: new Date(),
    };
  }

  incrementUsage(type: 'predictions' | 'chat'): boolean {
    if (!this.usage) this.resetUsage();

    const features = this.getFeatures();

    if (type === 'predictions') {
      if (this.usage!.currentPredictions >= features.predictionsPerMonth) {
        return false; // Usage limit exceeded
      }
      this.usage!.currentPredictions += 1;
    } else if (type === 'chat') {
      if (this.usage!.currentChatMessages >= features.chatMessagesPerMonth) {
        return false; // Usage limit exceeded
      }
      this.usage!.currentChatMessages += 1;
    }

    return true;
  }

  getFeatures(): NonNullable<typeof this.features> {
    const defaultFeatures = {
      predictionsPerMonth: 0,
      chatMessagesPerMonth: 0,
      advancedAnalytics: false,
      prioritySupport: false,
      customPrompts: false,
      bulkPredictions: false,
    };

    switch (this.plan) {
      case SubscriptionPlan.FREE:
        return {
          ...defaultFeatures,
          predictionsPerMonth: 10,
          chatMessagesPerMonth: 50,
        };
      case SubscriptionPlan.PRO:
        return {
          ...defaultFeatures,
          predictionsPerMonth: 100,
          chatMessagesPerMonth: 500,
          advancedAnalytics: true,
          customPrompts: true,
        };
      case SubscriptionPlan.ULTRA:
        return {
          ...defaultFeatures,
          predictionsPerMonth: 1000,
          chatMessagesPerMonth: 5000,
          advancedAnalytics: true,
          prioritySupport: true,
          customPrompts: true,
          bulkPredictions: true,
        };
      default:
        return defaultFeatures;
    }
  }
}
