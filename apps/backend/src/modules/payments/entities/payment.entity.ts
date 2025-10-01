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
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Subscription } from './subscription.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  USSD = 'USSD',
  QR = 'QR',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export enum PaymentType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME',
  RENEWAL = 'RENEWAL',
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Status of the payment',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Method used for payment',
});

registerEnumType(PaymentType, {
  name: 'PaymentType',
  description: 'Type of payment',
});

@Entity('payments')
@ObjectType()
@Index(['subscriptionId'])
@Index(['status'])
@Index(['paystackReference'], { unique: true })
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid', { nullable: true })
  subscriptionId?: string;

  @Column({ length: 255, unique: true })
  @Field()
  paystackReference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.SUBSCRIPTION,
  })
  @Field(() => PaymentType)
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  @Field(() => PaymentMethod, { nullable: true })
  method?: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field(() => Float)
  amount: number; // Amount in Naira

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  fees?: number; // Transaction fees

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  netAmount?: number; // Amount after fees

  @Column({ length: 10, default: 'NGN' })
  @Field()
  currency: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  failedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  refundedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  refundedAmount?: number;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  failureReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  paystackData?: {
    id?: number;
    domain?: string;
    status?: string;
    reference?: string;
    receipt_number?: string;
    amount?: number;
    message?: string;
    gateway_response?: string;
    paid_at?: string;
    created_at?: string;
    channel?: string;
    currency?: string;
    ip_address?: string;
    metadata?: any;
    fees_breakdown?: any;
    log?: any;
    customer?: any;
    authorization?: any;
    plan?: any;
    order_id?: string;
    payout?: any;
    requested_amount?: number;
    transaction_date?: string;
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
  @ManyToOne(() => Subscription, subscription => subscription.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriptionId' })
  @Field(() => Subscription, { nullable: true })
  subscription?: Subscription;

  // Helper methods
  @Field()
  get isSuccess(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  @Field()
  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  @Field()
  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  @Field()
  get isRefunded(): boolean {
    return (
      this.status === PaymentStatus.REFUNDED || this.status === PaymentStatus.PARTIALLY_REFUNDED
    );
  }

  @Field()
  get displayAmount(): string {
    return `₦${this.amount.toLocaleString()}`;
  }

  @Field({ nullable: true })
  get displayFees(): string | null {
    if (!this.fees) return null;
    return `₦${this.fees.toLocaleString()}`;
  }

  @Field({ nullable: true })
  get displayNetAmount(): string | null {
    if (!this.netAmount) return null;
    return `₦${this.netAmount.toLocaleString()}`;
  }

  @Field()
  get statusText(): string {
    switch (this.status) {
      case PaymentStatus.PENDING:
        return 'Pending';
      case PaymentStatus.SUCCESS:
        return 'Successful';
      case PaymentStatus.FAILED:
        return 'Failed';
      case PaymentStatus.CANCELLED:
        return 'Cancelled';
      case PaymentStatus.REFUNDED:
        return 'Refunded';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'Partially Refunded';
      default:
        return 'Unknown';
    }
  }

  @Field({ nullable: true })
  get methodText(): string | null {
    if (!this.method) return null;

    switch (this.method) {
      case PaymentMethod.CARD:
        return 'Card Payment';
      case PaymentMethod.BANK_TRANSFER:
        return 'Bank Transfer';
      case PaymentMethod.USSD:
        return 'USSD';
      case PaymentMethod.QR:
        return 'QR Code';
      case PaymentMethod.MOBILE_MONEY:
        return 'Mobile Money';
      default:
        return 'Unknown';
    }
  }

  @Field()
  get typeText(): string {
    switch (this.type) {
      case PaymentType.SUBSCRIPTION:
        return 'Subscription';
      case PaymentType.ONE_TIME:
        return 'One-time Payment';
      case PaymentType.RENEWAL:
        return 'Subscription Renewal';
      case PaymentType.UPGRADE:
        return 'Plan Upgrade';
      case PaymentType.DOWNGRADE:
        return 'Plan Downgrade';
      default:
        return 'Payment';
    }
  }

  @Field({ nullable: true })
  get duration(): number | null {
    if (!this.paidAt) return null;
    return this.paidAt.getTime() - this.createdAt.getTime();
  }

  markAsSuccess(paystackData?: any): void {
    this.status = PaymentStatus.SUCCESS;
    this.paidAt = new Date();

    if (paystackData) {
      this.paystackData = paystackData;
      this.fees = paystackData.fees ? paystackData.fees / 100 : undefined;
      this.netAmount = this.amount - (this.fees || 0);
      this.method = this.mapPaystackChannel(paystackData.channel);
    }
  }

  markAsFailed(reason?: string, paystackData?: any): void {
    this.status = PaymentStatus.FAILED;
    this.failedAt = new Date();
    this.failureReason = reason;

    if (paystackData) {
      this.paystackData = paystackData;
    }
  }

  markAsRefunded(amount?: number): void {
    const refundAmount = amount || this.amount;

    if (refundAmount >= this.amount) {
      this.status = PaymentStatus.REFUNDED;
    } else {
      this.status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    this.refundedAt = new Date();
    this.refundedAmount = refundAmount;
  }

  cancel(): void {
    if (this.status === PaymentStatus.PENDING) {
      this.status = PaymentStatus.CANCELLED;
    }
  }

  private mapPaystackChannel(channel?: string): PaymentMethod | undefined {
    if (!channel) return undefined;

    switch (channel.toLowerCase()) {
      case 'card':
        return PaymentMethod.CARD;
      case 'bank':
      case 'bank_transfer':
        return PaymentMethod.BANK_TRANSFER;
      case 'ussd':
        return PaymentMethod.USSD;
      case 'qr':
        return PaymentMethod.QR;
      case 'mobile_money':
        return PaymentMethod.MOBILE_MONEY;
      default:
        return PaymentMethod.CARD; // Default fallback
    }
  }

  updateFromPaystackWebhook(data: any): void {
    this.paystackData = data;

    switch (data.status?.toLowerCase()) {
      case 'success':
        this.markAsSuccess(data);
        break;
      case 'failed':
        this.markAsFailed(data.gateway_response || 'Payment failed', data);
        break;
      case 'abandoned':
      case 'cancelled':
        this.cancel();
        break;
    }
  }
}
