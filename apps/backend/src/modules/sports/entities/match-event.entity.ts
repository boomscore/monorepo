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
import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Match } from './match.entity';
import { Team } from './team.entity';

export enum MatchEventType {
  GOAL = 'GOAL',
  OWN_GOAL = 'OWN_GOAL',
  PENALTY_GOAL = 'PENALTY_GOAL',
  MISSED_PENALTY = 'MISSED_PENALTY',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION',
  CORNER = 'CORNER',
  FREE_KICK = 'FREE_KICK',
  OFFSIDE = 'OFFSIDE',
  FOUL = 'FOUL',
  INJURY = 'INJURY',
  VAR = 'VAR',
  KICKOFF = 'KICKOFF',
  HALFTIME = 'HALFTIME',
  FULLTIME = 'FULLTIME',
  EXTRA_TIME = 'EXTRA_TIME',
  PENALTY_SHOOTOUT = 'PENALTY_SHOOTOUT',
}

registerEnumType(MatchEventType, {
  name: 'MatchEventType',
  description: 'Type of match event',
});

@Entity('match_events')
@ObjectType()
@Index(['matchId'])
@Index(['teamId'])
@Index(['minute'])
@Index(['type'])
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  matchId: string;

  @Column('uuid', { nullable: true })
  teamId?: string;

  @Column({
    type: 'enum',
    enum: MatchEventType,
  })
  @Field(() => MatchEventType)
  type: MatchEventType;

  @Column({ type: 'int' })
  @Field(() => Int)
  minute: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  extraTime?: number; // Extra time minutes (e.g., 90+3)

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  player?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  assistPlayer?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  playerOut?: string; // For substitutions

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  playerIn?: string; // For substitutions

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  detail?: string; // Additional detail (e.g., "Header", "Right foot", etc.)

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  coordinates?: {
    x: number;
    y: number;
  }; // Position on the field where event occurred

  @Column({ type: 'int', nullable: true })
  apiEventId?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Match, match => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  @Field(() => Match)
  match: Match;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  @Field(() => Team, { nullable: true })
  team?: Team;

  // Helper methods
  @Field()
  get displayMinute(): string {
    if (this.extraTime && this.extraTime > 0) {
      return `${this.minute}+${this.extraTime}`;
    }
    return `${this.minute}'`;
  }

  @Field()
  get isImportant(): boolean {
    const importantEvents = [
      MatchEventType.GOAL,
      MatchEventType.OWN_GOAL,
      MatchEventType.PENALTY_GOAL,
      MatchEventType.MISSED_PENALTY,
      MatchEventType.RED_CARD,
    ];
    return importantEvents.includes(this.type);
  }

  @Field()
  get isScoring(): boolean {
    return [MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_GOAL].includes(
      this.type,
    );
  }

  @Field()
  get displayText(): string {
    switch (this.type) {
      case MatchEventType.GOAL:
        return `Goal by ${this.player}${this.assistPlayer ? ` (assist: ${this.assistPlayer})` : ''}`;
      case MatchEventType.OWN_GOAL:
        return `Own goal by ${this.player}`;
      case MatchEventType.PENALTY_GOAL:
        return `Penalty goal by ${this.player}`;
      case MatchEventType.MISSED_PENALTY:
        return `Penalty missed by ${this.player}`;
      case MatchEventType.YELLOW_CARD:
        return `Yellow card for ${this.player}`;
      case MatchEventType.RED_CARD:
        return `Red card for ${this.player}`;
      case MatchEventType.SUBSTITUTION:
        return `Substitution: ${this.playerOut} off, ${this.playerIn} on`;
      default:
        return this.description || this.type;
    }
  }

  @Field()
  get eventIcon(): string {
    switch (this.type) {
      case MatchEventType.GOAL:
      case MatchEventType.OWN_GOAL:
      case MatchEventType.PENALTY_GOAL:
        return '⚽';
      case MatchEventType.MISSED_PENALTY:
        return '❌';
      case MatchEventType.YELLOW_CARD:
        return '🟨';
      case MatchEventType.RED_CARD:
        return '🟥';
      case MatchEventType.SUBSTITUTION:
        return '🔄';
      case MatchEventType.CORNER:
        return '⏹️';
      case MatchEventType.VAR:
        return '📹';
      default:
        return '🔘';
    }
  }
}
