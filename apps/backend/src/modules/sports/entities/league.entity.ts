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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Sport } from './sport.entity';
import { Season } from './season.entity';
import { Team } from './team.entity';
import { Match } from './match.entity';

export enum LeagueType {
  LEAGUE = 'LEAGUE',
  CUP = 'CUP',
  PLAYOFFS = 'PLAYOFFS',
  FRIENDLY = 'FRIENDLY',
  QUALIFICATION = 'QUALIFICATION',
}

registerEnumType(LeagueType, {
  name: 'LeagueType',
  description: 'Type of league/competition',
});

@Entity('leagues')
@ObjectType()
@Index(['sportId'])
@Index(['slug'], { unique: true })
@Index(['apiId'], { unique: true })
@Index(['country'])
export class League {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  sportId: string;

  @Column({ length: 150 })
  @Field()
  name: string;

  @Column({ length: 150, unique: true })
  @Field()
  slug: string;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: LeagueType,
    default: LeagueType.LEAGUE,
  })
  @Field(() => LeagueType)
  type: LeagueType;

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
  flag?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  countryFlag?: string;

  @Column({ length: 50, unique: true })
  apiId: string;

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @Field()
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  @Field()
  sortOrder: number;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  seasonStart?: Date;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  seasonEnd?: Date;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  currentSeason?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Sport, sport => sport.leagues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sportId' })
  @Field(() => Sport)
  sport: Sport;

  @OneToMany(() => Season, season => season.league)
  @Field(() => [Season])
  seasons: Season[];

  @OneToMany(() => Team, team => team.league)
  @Field(() => [Team])
  teams: Team[];

  @OneToMany(() => Match, match => match.league)
  matches: Match[];

  // Helper methods
  @Field()
  get displayName(): string {
    return this.name;
  }

  @Field()
  get fullName(): string {
    return `${this.name} (${this.country})`;
  }

  @Field()
  get isCurrentlyActive(): boolean {
    if (!this.seasonStart || !this.seasonEnd) return true;

    const now = new Date();
    const start = new Date(this.seasonStart);
    const end = new Date(this.seasonEnd);

    return now >= start && now <= end;
  }

  @Field()
  get totalTeams(): number {
    return this.teams ? this.teams.length : 0;
  }

  @Field()
  get totalMatches(): number {
    return this.matches ? this.matches.length : 0;
  }
}
