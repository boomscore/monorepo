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
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '@/modules/users/entities/user.entity';
import { Session } from './session.entity';

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  OTHER = 'OTHER',
}

export enum DeviceStatus {
  TRUSTED = 'TRUSTED',
  UNTRUSTED = 'UNTRUSTED',
  BLOCKED = 'BLOCKED',
}

registerEnumType(DeviceType, {
  name: 'DeviceType',
  description: 'Device type categories',
});

registerEnumType(DeviceStatus, {
  name: 'DeviceStatus',
  description: 'Device trust status',
});

@Entity('devices')
@ObjectType()
@Index(['userId'])
@Index(['fingerprint'], { unique: true })
export class Device {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ unique: true, length: 255 })
  @Field()
  fingerprint: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.OTHER,
  })
  @Field(() => DeviceType)
  type: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.UNTRUSTED,
  })
  @Field(() => DeviceStatus)
  status: DeviceStatus;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  browser?: string;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  browserVersion?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  os?: string;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  osVersion?: string;

  @Column({ type: 'inet', nullable: true })
  @Field({ nullable: true })
  lastSeenIp?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastSeenAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  trustedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  blockedAt?: Date;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  blockedReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Session, session => session.device)
  sessions: Session[];

  // Helper methods
  trust(): void {
    this.status = DeviceStatus.TRUSTED;
    this.trustedAt = new Date();
  }

  block(reason?: string): void {
    this.status = DeviceStatus.BLOCKED;
    this.blockedAt = new Date();
    this.blockedReason = reason;
  }

  updateLastSeen(ip?: string, location?: string): void {
    this.lastSeenAt = new Date();
    if (ip) this.lastSeenIp = ip;
    if (location) this.location = location;
  }

  @Field()
  get isTrusted(): boolean {
    return this.status === DeviceStatus.TRUSTED;
  }

  @Field()
  get isBlocked(): boolean {
    return this.status === DeviceStatus.BLOCKED;
  }

  @Field()
  get displayName(): string {
    if (this.name) return this.name;
    
    const parts = [];
    if (this.browser) parts.push(this.browser);
    if (this.os) parts.push(`on ${this.os}`);
    
    return parts.length > 0 ? parts.join(' ') : 'Unknown Device';
  }
}
