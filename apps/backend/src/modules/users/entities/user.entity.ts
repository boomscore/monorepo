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
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Device } from '@/modules/auth/entities/device.entity';
import { Session } from '@/modules/auth/entities/session.entity';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity';
import { Prediction } from '@/modules/predictions/entities/prediction.entity';
import { PredictionBatch } from '@/modules/predictions/entities/prediction-batch.entity';
import { Conversation } from '@/modules/chat/entities/conversation.entity';
import { Subscription } from '@/modules/payments/entities/subscription.entity';
import { SubscriptionPlan } from '@/modules/payments/entities/subscription.entity';

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role levels',
});

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

registerEnumType(SubscriptionPlan, {
  name: 'SubscriptionPlan',
  description: 'Available subscription plans',
});

@Entity('users')
@ObjectType()
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true, length: 255 })
  @Field()
  email: string;

  @Column({ unique: true, length: 100 })
  @Field()
  username: string;

  @Column({ length: 255 })
  password: string; // Not exposed in GraphQL

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  firstName?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  lastName?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  avatar?: string;

  @Column({ length: 20, nullable: true })
  @Field({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  country?: string;

  @Column({ length: 10, nullable: true })
  @Field({ nullable: true })
  timezone?: string;

  @Column({ length: 10, nullable: true })
  @Field({ nullable: true })
  preferredLanguage?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @Field(() => UserRole)
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @Field(() => UserStatus)
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  @Field(() => SubscriptionPlan)
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  subscriptionExpiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  @Field()
  emailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'boolean', default: false })
  @Field()
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Usage limits for different subscription plans
  @Column({ type: 'int', default: 0 })
  @Field()
  monthlyPredictions: number;

  @Column({ type: 'int', default: 0 })
  @Field()
  monthlyChatMessages: number;

  @Column({ type: 'timestamp', nullable: true })
  usagePeriodStart?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Device, device => device.user, { cascade: true })
  devices: Device[];

  @OneToMany(() => Session, session => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => RefreshToken, token => token.user, { cascade: true })
  refreshTokens: RefreshToken[];

  @OneToMany(() => Prediction, prediction => prediction.user)
  predictions: Prediction[];

  @OneToMany(() => PredictionBatch, batch => batch.user)
  predictionBatches: PredictionBatch[];

  @OneToMany(() => Conversation, conversation => conversation.user)
  conversations: Conversation[];

  @OneToOne(() => Subscription, subscription => subscription.user)
  subscription?: Subscription;

  // Virtual fields
  @Field()
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
  }

  @Field()
  get isSubscribed(): boolean {
    return this.subscriptionPlan !== SubscriptionPlan.FREE;
  }

  @Field()
  get subscriptionActive(): boolean {
    if (!this.subscriptionExpiresAt) return false;
    return this.subscriptionExpiresAt > new Date();
  }

  // Helper methods for usage limits
  getPredictionLimit(): number {
    switch (this.subscriptionPlan) {
      case SubscriptionPlan.FREE:
        return 10; // 10 predictions per month
      case SubscriptionPlan.PRO:
        return 100; // 100 predictions per month
      case SubscriptionPlan.ULTRA:
        return 1000; // 1000 predictions per month
      default:
        return 10;
    }
  }

  getChatMessageLimit(): number {
    switch (this.subscriptionPlan) {
      case SubscriptionPlan.FREE:
        return 50; // 50 messages per month
      case SubscriptionPlan.PRO:
        return 500; // 500 messages per month
      case SubscriptionPlan.ULTRA:
        return 5000; // 5000 messages per month
      default:
        return 50;
    }
  }

  canUsePredictions(): boolean {
    return this.monthlyPredictions < this.getPredictionLimit();
  }

  canUseChat(): boolean {
    return this.monthlyChatMessages < this.getChatMessageLimit();
  }

  resetUsagePeriod(): void {
    this.monthlyPredictions = 0;
    this.monthlyChatMessages = 0;
    this.usagePeriodStart = new Date();
  }
}
