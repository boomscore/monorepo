import { Resolver, Query, Args } from '@nestjs/graphql';
import { MatchesService, MatchFilters } from '../services/matches.service';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { GroupedMatchesResult, HeadToHeadStats } from '../dto/league-group.dto';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(private readonly matchesService: MatchesService) {}

  @Query(() => [Match])
  async matches(
    @Args('date', { nullable: true }) date?: string,
    @Args('leagueId', { nullable: true }) leagueId?: string,
    @Args('teamId', { nullable: true }) teamId?: string,
    @Args('isLive', { nullable: true }) isLive?: boolean,
    @Args('isToday', { nullable: true }) isToday?: boolean,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<Match[]> {
    const filters: MatchFilters = {};
    if (date) filters.date = date;
    if (leagueId) filters.leagueId = leagueId;
    if (teamId) filters.teamId = teamId;
    if (isLive !== undefined) filters.isLive = isLive;
    if (isToday !== undefined) filters.isToday = isToday;
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    return this.matchesService.findMatches(filters);
  }

  @Query(() => Match, { nullable: true })
  async match(@Args('id') id: string): Promise<Match | null> {
    return this.matchesService.findById(id);
  }

  @Query(() => [Match])
  async headToHeadMatches(
    @Args('homeTeamId') homeTeamId: string,
    @Args('awayTeamId') awayTeamId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<Match[]> {
    return this.matchesService.findHeadToHeadMatches(homeTeamId, awayTeamId, limit || 10);
  }

  @Query(() => HeadToHeadStats)
  async headToHeadStats(
    @Args('homeTeamId') homeTeamId: string,
    @Args('awayTeamId') awayTeamId: string,
  ): Promise<HeadToHeadStats> {
    return this.matchesService.findHeadToHeadStats(homeTeamId, awayTeamId);
  }

  @Query(() => [Match])
  async teamRecentMatches(
    @Args('teamId') teamId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<Match[]> {
    return this.matchesService.findTeamRecentMatches(teamId, limit || 5);
  }

  @Query(() => [Match])
  async teamUpcomingMatches(
    @Args('teamId') teamId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<Match[]> {
    return this.matchesService.findTeamUpcomingMatches(teamId, limit || 5);
  }

  @Query(() => GroupedMatchesResult)
  async matchesGroupedByLeague(
    @Args('date', { nullable: true }) date?: string,
    @Args('leagueId', { nullable: true }) leagueId?: string,
    @Args('teamId', { nullable: true }) teamId?: string,
    @Args('isLive', { nullable: true }) isLive?: boolean,
    @Args('isToday', { nullable: true }) isToday?: boolean,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<GroupedMatchesResult> {
    const filters: MatchFilters = {};
    if (date) filters.date = date;
    if (leagueId) filters.leagueId = leagueId;
    if (teamId) filters.teamId = teamId;
    if (isLive !== undefined) filters.isLive = isLive;
    if (isToday !== undefined) filters.isToday = isToday;
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    return this.matchesService.findMatchesGroupedByLeague(filters);
  }

  @Query(() => [Match])
  async liveMatches(): Promise<Match[]> {
    return this.matchesService.findLiveMatches();
  }

  @Query(() => [Match])
  async todaysMatches(): Promise<Match[]> {
    return this.matchesService.getTodaysMatches();
  }

  @Query(() => Match, { nullable: true })
  async matchWithDetails(
    @Args('id') id: string,
    @Args('includeEvents', { nullable: true }) includeEvents?: boolean,
    @Args('includeStatistics', { nullable: true }) includeStatistics?: boolean,
  ): Promise<Match> {
    return this.matchesService.findMatchWithDetails(id, {
      includeEvents,
      includeStatistics,
    });
  }

  @Query(() => [MatchEvent])
  async matchEvents(@Args('matchId') matchId: string) {
    return this.matchesService.getMatchEvents(matchId);
  }
}
