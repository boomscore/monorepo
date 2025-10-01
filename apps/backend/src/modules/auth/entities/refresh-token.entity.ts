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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '@/modules/users/entities/user.entity';

export enum RefreshTokenStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(RefreshTokenStatus, {
  name: 'RefreshTokenStatus',
  description: 'Refresh token status',
});

@Entity('refresh_tokens')
@ObjectType()
@Index(['userId'])
@Index(['token'], { unique: true })
@Index(['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ unique: true, length: 255 })
  token: string; // Not exposed in GraphQL

  @Column({
    type: 'enum',
    enum: RefreshTokenStatus,
    default: RefreshTokenStatus.ACTIVE,
  })
  @Field(() => RefreshTokenStatus)
  status: RefreshTokenStatus;

  @Column({ type: 'timestamp' })
  @Field()
  expiresAt: Date;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ length: 500, nullable: true })
  revokedReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper methods
  @Field()
  get isActive(): boolean {
    return this.status === RefreshTokenStatus.ACTIVE && this.expiresAt > new Date();
  }

  @Field()
  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  @Field()
  get isUsed(): boolean {
    return this.status === RefreshTokenStatus.USED;
  }

  @Field()
  get isRevoked(): boolean {
    return this.status === RefreshTokenStatus.REVOKED;
  }

  use(): void {
    this.status = RefreshTokenStatus.USED;
    this.usedAt = new Date();
  }

  revoke(reason?: string): void {
    this.status = RefreshTokenStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedReason = reason;
  }

  expire(): void {
    this.status = RefreshTokenStatus.EXPIRED;
  }
}
