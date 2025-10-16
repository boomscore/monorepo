import { ObjectType, Field, Int } from '@nestjs/graphql';
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
