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
import { User } from '@/modules/users/entities/user.entity';
import { Match } from '@/modules/sports/entities/match.entity';
import { PredictionBatch } from './prediction-batch.entity';

export enum PredictionType {
  MATCH_WINNER = 'MATCH_WINNER',
  BOTH_TEAMS_SCORE = 'BOTH_TEAMS_SCORE',
  OVER_UNDER = 'OVER_UNDER',
  HANDICAP = 'HANDICAP',
  CORRECT_SCORE = 'CORRECT_SCORE',
  FIRST_GOAL_SCORER = 'FIRST_GOAL_SCORER',
  TOTAL_GOALS = 'TOTAL_GOALS',
  HALF_TIME_RESULT = 'HALF_TIME_RESULT',
  DOUBLE_CHANCE = 'DOUBLE_CHANCE',
  DRAW_NO_BET = 'DRAW_NO_BET',
  CLEAN_SHEET = 'CLEAN_SHEET',
  WIN_TO_NIL = 'WIN_TO_NIL',
  GOALS_ODD_EVEN = 'GOALS_ODD_EVEN',
  TEAM_TOTAL_GOALS = 'TEAM_TOTAL_GOALS',
  CORNERS = 'CORNERS',
  CARDS = 'CARDS',
}

export enum PredictionOutcome {
  HOME_WIN = 'HOME_WIN',
  AWAY_WIN = 'AWAY_WIN',
  DRAW = 'DRAW',
  OVER = 'OVER',
  UNDER = 'UNDER',
  YES = 'YES',
  NO = 'NO',
  ODD = 'ODD',
  EVEN = 'EVEN',
  CUSTOM = 'CUSTOM',
}

export enum PredictionStatus {
  PENDING = 'PENDING',
  CORRECT = 'CORRECT',
  INCORRECT = 'INCORRECT',
  FINISHED = 'FINISHED',
  VOID = 'VOID',
  PUSH = 'PUSH',
}

registerEnumType(PredictionType, {
  name: 'PredictionType',
  description: 'Type of prediction',
});

registerEnumType(PredictionOutcome, {
  name: 'PredictionOutcome',
  description: 'Predicted outcome',
});

registerEnumType(PredictionStatus, {
  name: 'PredictionStatus',
  description: 'Status of the prediction result',
});

@Entity('predictions')
@ObjectType()
@Index(['userId'])
@Index(['matchId'])
@Index(['batchId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  matchId: string;

  @Column('uuid', { nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: PredictionType,
  })
  @Field(() => PredictionType)
  type: PredictionType;

  @Column({
    type: 'enum',
    enum: PredictionOutcome,
  })
  @Field(() => PredictionOutcome)
  outcome: PredictionOutcome;

  @Column({
    type: 'enum',
    enum: PredictionOutcome,
    nullable: true,
  })
  @Field(() => PredictionOutcome, { nullable: true })
  actualOutcome?: PredictionOutcome;

  @Column({
    type: 'enum',
    enum: PredictionStatus,
    default: PredictionStatus.PENDING,
  })
  @Field(() => PredictionStatus)
  status: PredictionStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Field(() => Float)
  confidence: number; // 0-100

  @Column({ type: 'decimal', precision: 8, scale: 5, nullable: true })
  @Field(() => Float, { nullable: true })
  odds?: number; // Decimal odds at time of prediction

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  stake?: number; // If user placed a stake

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  potentialWin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  actualWin?: number;

  @Column({ length: 1000, nullable: true })
  @Field({ nullable: true })
  reasoning?: string; // AI-generated reasoning

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  scenario?: string; // User-provided scenario/context

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  details?: {
    // For specific prediction types
    line?: number; // For over/under, handicap
    homeScore?: number; // For correct score
    awayScore?: number; // For correct score
    playerName?: string; // For scorer predictions
    targetValue?: number; // For various numeric predictions
    customText?: string; // For custom predictions
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  contextData?: {
    // Data used for prediction
    homeTeamForm?: string[];
    awayTeamForm?: string[];
    headToHead?: any[];
    injuries?: string[];
    weather?: string;
    venue?: string;
    lastMatches?: any[];
  };

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  actualResult?: {
    homeScore?: number;
    awayScore?: number;
    totalGoals?: number;
    outcome?: string;
    details?: any;
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
  @ManyToOne(() => User, user => user.predictions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Match, match => match.predictions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  @Field(() => Match)
  match: Match;

  @ManyToOne(() => PredictionBatch, batch => batch.predictions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'batchId' })
  @Field(() => PredictionBatch, { nullable: true })
  batch?: PredictionBatch;

  // Helper methods
  @Field()
  get isPending(): boolean {
    return this.status === PredictionStatus.PENDING;
  }

  @Column({ type: 'boolean', nullable: true })
  @Field({ nullable: true })
  isCorrect?: boolean;

  @Field()
  get isIncorrect(): boolean {
    return this.status === PredictionStatus.INCORRECT;
  }

  @Field()
  get isResolved(): boolean {
    return this.status !== PredictionStatus.PENDING;
  }

  @Field()
  get displayText(): string {
    switch (this.type) {
      case PredictionType.MATCH_WINNER:
        switch (this.outcome) {
          case PredictionOutcome.HOME_WIN:
            return 'Home team wins';
          case PredictionOutcome.AWAY_WIN:
            return 'Away team wins';
          case PredictionOutcome.DRAW:
            return 'Match ends in a draw';
        }
        break;
      case PredictionType.BOTH_TEAMS_SCORE:
        return this.outcome === PredictionOutcome.YES
          ? 'Both teams will score'
          : 'Both teams will not score';
      case PredictionType.OVER_UNDER:
        return `${this.outcome === PredictionOutcome.OVER ? 'Over' : 'Under'} ${this.details?.line} goals`;
      case PredictionType.CORRECT_SCORE:
        return `Correct score: ${this.details?.homeScore}-${this.details?.awayScore}`;
      default:
        return `${this.type}: ${this.outcome}`;
    }
    return 'Unknown prediction';
  }

  @Field()
  get confidenceLevel(): string {
    if (this.confidence >= 80) return 'High';
    if (this.confidence >= 60) return 'Medium';
    if (this.confidence >= 40) return 'Low';
    return 'Very Low';
  }

  @Field({ nullable: true })
  get profitLoss(): number | null {
    if (!this.actualWin || !this.stake) return null;
    return this.actualWin - this.stake;
  }

  resolve(actualResult: any, matchResult: any): void {
    this.actualResult = actualResult;
    this.resolvedAt = new Date();

    // Logic to determine if prediction was correct
    // This would be implemented based on specific prediction type
    const isCorrect = this.evaluatePrediction(actualResult, matchResult);

    if (isCorrect === null) {
      this.status = PredictionStatus.VOID;
    } else if (isCorrect) {
      this.status = PredictionStatus.CORRECT;
      if (this.stake && this.odds) {
        this.actualWin = this.stake * this.odds;
      }
    } else {
      this.status = PredictionStatus.INCORRECT;
      this.actualWin = 0;
    }
  }

  private evaluatePrediction(actualResult: any, matchResult: any): boolean | null {
    switch (this.type) {
      case PredictionType.MATCH_WINNER:
        if (this.outcome === PredictionOutcome.HOME_WIN) {
          return matchResult.homeScore > matchResult.awayScore;
        } else if (this.outcome === PredictionOutcome.AWAY_WIN) {
          return matchResult.awayScore > matchResult.homeScore;
        } else if (this.outcome === PredictionOutcome.DRAW) {
          return matchResult.homeScore === matchResult.awayScore;
        }
        break;

      case PredictionType.BOTH_TEAMS_SCORE:
        const bothScored = matchResult.homeScore > 0 && matchResult.awayScore > 0;
        return (this.outcome === PredictionOutcome.YES) === bothScored;

      case PredictionType.OVER_UNDER:
        const totalGoals = matchResult.homeScore + matchResult.awayScore;
        const line = this.details?.line || 2.5;
        if (this.outcome === PredictionOutcome.OVER) {
          return totalGoals > line;
        } else {
          return totalGoals < line;
        }

      case PredictionType.CORRECT_SCORE:
        return (
          matchResult.homeScore === this.details?.homeScore &&
          matchResult.awayScore === this.details?.awayScore
        );

      default:
        return null; // Unknown prediction type
    }

    return null;
  }
}
