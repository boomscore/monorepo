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

@Entity('seasons')
@ObjectType()
@Index(['leagueId'])
@Index(['year'])
@Index(['leagueId', 'year'], { unique: true })
export class Season {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  leagueId: string;

  @Column({ type: 'int' })
  @Field()
  year: number;

  @Column({ length: 100 })
  @Field()
  name: string;

  @Column({ type: 'date' })
  @Field()
  startDate: Date;

  @Column({ type: 'date' })
  @Field()
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  @Field()
  isCurrent: boolean;

  @Column({ type: 'boolean', default: false })
  @Field()
  isFinished: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  standings?: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => League, league => league.seasons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leagueId' })
  @Field(() => League)
  league: League;

  @OneToMany(() => Match, match => match.season)
  matches: Match[];

  // Helper methods
  @Field()
  get displayName(): string {
    return `${this.name} ${this.year}`;
  }

  @Field()
  get isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  @Field()
  get totalMatches(): number {
    return this.matches ? this.matches.length : 0;
  }

  @Field()
  get progress(): number {
    if (!this.isActive) return this.isFinished ? 100 : 0;

    const now = new Date();
    const total = this.endDate.getTime() - this.startDate.getTime();
    const elapsed = now.getTime() - this.startDate.getTime();

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }
}
