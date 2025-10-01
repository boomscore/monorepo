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
import { Device } from './device.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

registerEnumType(SessionStatus, {
  name: 'SessionStatus',
  description: 'Session status',
});

@Entity('sessions')
@ObjectType()
@Index(['userId'])
@Index(['deviceId'])
@Index(['token'], { unique: true })
@Index(['expiresAt'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  deviceId?: string;

  @Column({ unique: true, length: 255 })
  token: string; // Not exposed in GraphQL

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @Field(() => SessionStatus)
  status: SessionStatus;

  @Column({ type: 'timestamp' })
  @Field()
  expiresAt: Date;

  @Column({ type: 'inet', nullable: true })
  @Field({ nullable: true })
  ipAddress?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastActiveAt?: Date;

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
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Device, device => device.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device?: Device;

  // Helper methods
  @Field()
  get isActive(): boolean {
    return this.status === SessionStatus.ACTIVE && this.expiresAt > new Date();
  }

  @Field()
  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  @Field()
  get isRevoked(): boolean {
    return this.status === SessionStatus.REVOKED;
  }

  revoke(reason?: string): void {
    this.status = SessionStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedReason = reason;
  }

  expire(): void {
    this.status = SessionStatus.EXPIRED;
  }

  updateActivity(ipAddress?: string, location?: string): void {
    this.lastActiveAt = new Date();
    if (ipAddress) this.ipAddress = ipAddress;
    if (location) this.location = location;
  }

  extend(minutes: number = 15): void {
    if (this.isActive) {
      this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    }
  }
}
