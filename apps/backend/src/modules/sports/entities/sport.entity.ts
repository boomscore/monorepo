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
  Index,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { League } from './league.entity';

@Entity('sports')
@ObjectType()
@Index(['slug'], { unique: true })
@Index(['apiId'], { unique: true })
export class Sport {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ length: 100 })
  @Field()
  name: string;

  @Column({ length: 100, unique: true })
  @Field()
  slug: string;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  icon?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  image?: string;

  @Column({ length: 50, unique: true })
  apiId: string;

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  @Field()
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => League, league => league.sport)
  @Field(() => [League])
  leagues: League[];

  // Helper methods
  @Field()
  get displayName(): string {
    return this.name;
  }

  @Field()
  get totalLeagues(): number {
    return this.leagues ? this.leagues.length : 0;
  }
}
