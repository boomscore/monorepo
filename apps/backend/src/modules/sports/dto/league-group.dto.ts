import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { League } from '../entities/league.entity';
import { Match } from '../entities/match.entity';

@ObjectType()
export class LeagueGroup {
  @Field(() => League)
  league: League;

  @Field(() => [Match])
  matches: Match[];

  @Field(() => Int)
  totalMatches: number;

  @Field()
  hasLiveMatches: boolean;

  @Field()
  hasUpcomingMatches: boolean;
}

@ObjectType()
export class GroupedMatchesResult {
  @Field(() => [LeagueGroup])
  groups: LeagueGroup[];

  @Field(() => Int)
  totalMatches: number;

  @Field(() => Int)
  totalGroups: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class HeadToHeadStats {
  @Field(() => Int)
  totalMatches: number;

  @Field(() => Int)
  homeWins: number;

  @Field(() => Int)
  awayWins: number;

  @Field(() => Int)
  draws: number;

  @Field(() => Int)
  totalGoals: number;

  @Field(() => Int)
  homeGoals: number;

  @Field(() => Int)
  awayGoals: number;

  @Field(() => Float)
  homeWinPercent: number;

  @Field(() => Float)
  awayWinPercent: number;

  @Field(() => Float)
  drawPercent: number;

  @Field(() => Float)
  avgPointsPerGame: number;

  @Field(() => [Match])
  recentMatches: Match[];
}
