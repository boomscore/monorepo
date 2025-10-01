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
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { League } from './league.entity';
import { Season } from './season.entity';
import { Team } from './team.entity';
import { MatchEvent } from './match-event.entity';
import { Prediction } from '@/modules/predictions/entities/prediction.entity';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  HALFTIME = 'HALFTIME',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
  ABANDONED = 'ABANDONED',
  SUSPENDED = 'SUSPENDED',
}

export enum MatchResult {
  HOME_WIN = 'HOME_WIN',
  AWAY_WIN = 'AWAY_WIN',
  DRAW = 'DRAW',
  PENDING = 'PENDING',
}

registerEnumType(MatchStatus, {
  name: 'MatchStatus',
  description: 'Current status of the match',
});

registerEnumType(MatchResult, {
  name: 'MatchResult',
  description: 'Final result of the match',
});

@Entity('matches')
@ObjectType()
@Index(['leagueId'])
@Index(['seasonId'])
@Index(['homeTeamId'])
@Index(['awayTeamId'])
@Index(['startTime'])
@Index(['status'])
@Index(['apiId'], { unique: true })
@Index(['startTime', 'status']) // Composite index for common queries
export class Match {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  leagueId: string;

  @Column('uuid', { nullable: true })
  seasonId?: string;

  @Column('uuid')
  homeTeamId: string;

  @Column('uuid')
  awayTeamId: string;

  @Column({ type: 'timestamp' })
  @Field()
  startTime: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  @Field(() => MatchStatus)
  status: MatchStatus;

  @Column({
    type: 'enum',
    enum: MatchResult,
    default: MatchResult.PENDING,
  })
  @Field(() => MatchResult)
  result: MatchResult;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  homeScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  awayScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  homeHalfTimeScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  awayHalfTimeScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  homeExtraTimeScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  awayExtraTimeScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  homePenaltyScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  awayPenaltyScore?: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  minute?: number; // Current minute for live matches

  @Column({ length: 20, nullable: true })
  @Field({ nullable: true })
  period?: string; // Current period (1H, 2H, ET, P)

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  venue?: string;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  referee?: string;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  attendance?: number;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  weather?: string;

  @Column({ type: 'int', unique: true })
  apiId: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  round?: number;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  roundName?: string;

  @Column({ type: 'boolean', default: false })
  @Field()
  isFeatured: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  finishedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  odds?: {
    home?: number;
    draw?: number;
    away?: number;
    overUnder?: {
      line: number;
      over: number;
      under: number;
    };
    handicap?: {
      line: number;
      home: number;
      away: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  statistics?: {
    home?: {
      possession?: number;
      shots?: number;
      shotsOnTarget?: number;
      corners?: number;
      fouls?: number;
      yellowCards?: number;
      redCards?: number;
    };
    away?: {
      possession?: number;
      shots?: number;
      shotsOnTarget?: number;
      corners?: number;
      fouls?: number;
      yellowCards?: number;
      redCards?: number;
    };
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
  @ManyToOne(() => League, league => league.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leagueId' })
  @Field(() => League)
  league: League;

  @ManyToOne(() => Season, season => season.matches, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seasonId' })
  @Field(() => Season, { nullable: true })
  season?: Season;

  @ManyToOne(() => Team, team => team.homeMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'homeTeamId' })
  @Field(() => Team)
  homeTeam: Team;

  @ManyToOne(() => Team, team => team.awayMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'awayTeamId' })
  @Field(() => Team)
  awayTeam: Team;

  @OneToMany(() => MatchEvent, event => event.match)
  @Field(() => [MatchEvent])
  events: MatchEvent[];

  @OneToMany(() => Prediction, prediction => prediction.match)
  predictions: Prediction[];

  // Helper methods
  @Field()
  get isLive(): boolean {
    return this.status === MatchStatus.LIVE || this.status === MatchStatus.HALFTIME;
  }

  @Field()
  get isFinished(): boolean {
    return this.status === MatchStatus.FINISHED;
  }

  @Field()
  get isUpcoming(): boolean {
    return this.status === MatchStatus.SCHEDULED && this.startTime > new Date();
  }

  @Field()
  get hasStarted(): boolean {
    return this.startTime <= new Date() || this.status !== MatchStatus.SCHEDULED;
  }

  @Field({ nullable: true })
  get totalGoals(): number | null {
    if (this.homeScore === null || this.awayScore === null) return null;
    return this.homeScore + this.awayScore;
  }

  @Field()
  get displayScore(): string {
    if (this.homeScore !== null && this.awayScore !== null) {
      return `${this.homeScore}-${this.awayScore}`;
    }
    return '-';
  }

  @Field()
  get shortStatus(): string {
    switch (this.status) {
      case MatchStatus.SCHEDULED:
        return 'SCH';
      case MatchStatus.LIVE:
        return this.minute ? `${this.minute}'` : 'LIVE';
      case MatchStatus.HALFTIME:
        return 'HT';
      case MatchStatus.FINISHED:
        return 'FT';
      case MatchStatus.POSTPONED:
        return 'PP';
      case MatchStatus.CANCELLED:
        return 'CAN';
      case MatchStatus.ABANDONED:
        return 'ABD';
      case MatchStatus.SUSPENDED:
        return 'SUS';
      default:
        return 'UNK';
    }
  }

  @Field()
  get timeUntilStart(): number {
    return Math.max(0, this.startTime.getTime() - Date.now());
  }

  @Field({ nullable: true })
  get winnerTeamId(): string | null {
    if (this.result === MatchResult.HOME_WIN) return this.homeTeamId;
    if (this.result === MatchResult.AWAY_WIN) return this.awayTeamId;
    return null;
  }

  updateScore(homeScore: number, awayScore: number): void {
    this.homeScore = homeScore;
    this.awayScore = awayScore;

    // Update result based on scores
    if (this.status === MatchStatus.FINISHED) {
      if (homeScore > awayScore) {
        this.result = MatchResult.HOME_WIN;
      } else if (awayScore > homeScore) {
        this.result = MatchResult.AWAY_WIN;
      } else {
        this.result = MatchResult.DRAW;
      }
    }
  }

  updateStatus(status: MatchStatus, minute?: number): void {
    this.status = status;
    if (minute !== undefined) {
      this.minute = minute;
    }

    if (status === MatchStatus.FINISHED && !this.finishedAt) {
      this.finishedAt = new Date();
    }
  }

  addEvent(event: Partial<MatchEvent>): void {
    if (!this.events) this.events = [];
    this.events.push(event as MatchEvent);
  }

  getRecentForm(): { homeForm: string; awayForm: string } {
    // This would typically be calculated from recent matches
    // For now, return empty strings - would be populated by a service
    return {
      homeForm: '',
      awayForm: '',
    };
  }

  getH2HStats(): any {
    // Head-to-head statistics would be calculated by a service
    return null;
  }
}
