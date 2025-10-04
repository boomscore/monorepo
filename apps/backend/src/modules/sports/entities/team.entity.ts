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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { League } from './league.entity';
import { Match } from './match.entity';

@Entity('teams')
@ObjectType()
@Index(['leagueId'])
@Index(['slug'], { unique: true })
@Index(['apiId'], { unique: true })
@Index(['country'])
export class Team {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  leagueId: string;

  @Column({ length: 150 })
  @Field()
  name: string;

  @Column({ length: 150, unique: true })
  @Field()
  slug: string;

  @Column({ length: 150, nullable: true })
  @Field({ nullable: true })
  shortName?: string;

  @Column({ length: 10, nullable: true })
  @Field({ nullable: true })
  code?: string;

  @Column({ length: 100 })
  @Field()
  country: string;

  @Column({ length: 10, nullable: true })
  @Field({ nullable: true })
  countryCode?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  logo?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  venue?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  venueAddress?: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  venueCapacity?: number;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  venueImage?: string;

  @Column({ length: 50, unique: true })
  apiId: string;

  @Column({ type: 'int', nullable: true })
  venueId?: number;

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  founded?: number;

  @Column({ type: 'boolean', default: false })
  @Field()
  isNational: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  form?: string[]; // Recent match results: ['W', 'L', 'D', 'W', 'L']

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  statistics?: {
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    points?: number;
    position?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => League, league => league.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leagueId' })
  @Field(() => League)
  league: League;

  @OneToMany(() => Match, match => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, match => match.awayTeam)
  awayMatches: Match[];

  @Field()
  get displayName(): string {
    return this.shortName || this.name;
  }

  @Field()
  get fullName(): string {
    return this.name;
  }

  @Field()
  get totalMatches(): number {
    const home = this.homeMatches ? this.homeMatches.length : 0;
    const away = this.awayMatches ? this.awayMatches.length : 0;
    return home + away;
  }

  @Field({ nullable: true })
  get winRate(): number | null {
    if (!this.statistics?.played) return null;
    return ((this.statistics.wins || 0) / this.statistics.played) * 100;
  }

  @Field({ nullable: true })
  get goalDifference(): number | null {
    if (this.statistics?.goalsFor === undefined || this.statistics?.goalsAgainst === undefined) {
      return null;
    }
    return this.statistics.goalsFor - this.statistics.goalsAgainst;
  }

  @Field({ nullable: true })
  get currentForm(): string | null {
    if (!this.form || this.form.length === 0) return null;
    return this.form.slice(-5).join(''); 
  }

  @Field()
  get isHomeTeam(): boolean {
    // This would be set contextually when used in match queries
    return false;
  }

  updateForm(result: 'W' | 'L' | 'D'): void {
    if (!this.form) this.form = [];
    this.form.push(result);
    if (this.form.length > 10) {
      this.form = this.form.slice(-10);
    }
  }

  updateStatistics(stats: Partial<typeof this.statistics>): void {
    this.statistics = {
      ...this.statistics,
      ...stats,
    };
  }
}
