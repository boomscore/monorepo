import { Resolver, Query, Args } from '@nestjs/graphql';
import { MatchesService, MatchFilters } from '../services/matches.service';
import { SportsQueryService } from '../services/sports-query.service';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { GroupedMatchesResult, HeadToHeadStats } from '../dto/league-group.dto';
import { MatchLineups } from '../dto/lineup.dto';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly sportsQueryService: SportsQueryService,
  ) {}

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

  @Query(() => MatchLineups, { nullable: true })
  async matchLineups(@Args('matchId') matchId: string): Promise<MatchLineups | null> {
    try {
      const match = await this.matchesService.findById(matchId);
      if (!match || !match.apiId) {
        return null;
      }

      const lineups = await this.sportsQueryService.getLineups({
        fixtureApiId: parseInt(match.apiId, 10),
      });

      if (lineups.length === 0) {
        return null;
      }

      const homeTeam = lineups.find(lineup =>
        lineup.team.name.toLowerCase().includes(match.homeTeam?.name.toLowerCase() || ''),
      );
      const awayTeam =
        lineups.find(lineup =>
          lineup.team.name.toLowerCase().includes(match.awayTeam?.name.toLowerCase() || ''),
        ) || lineups.find(lineup => lineup !== homeTeam);

      return {
        homeTeam: homeTeam
          ? {
              name: homeTeam.team.name,
              logo: homeTeam.team.logo,
              formation: homeTeam.formation,
              startXI: homeTeam.startXI.map(player => ({
                name: player.player.name,
                number: player.player.number,
                position: player.player.pos,
              })),
              substitutes: homeTeam.substitutes.map(player => ({
                name: player.player.name,
                number: player.player.number,
                position: player.player.pos,
              })),
              coach: homeTeam.coach,
            }
          : undefined,
        awayTeam: awayTeam
          ? {
              name: awayTeam.team.name,
              logo: awayTeam.team.logo,
              formation: awayTeam.formation,
              startXI: awayTeam.startXI.map(player => ({
                name: player.player.name,
                number: player.player.number,
                position: player.player.pos,
              })),
              substitutes: awayTeam.substitutes.map(player => ({
                name: player.player.name,
                number: player.player.number,
                position: player.player.pos,
              })),
              coach: awayTeam.coach,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Failed to fetch match lineups:', error);
      return null;
    }
  }
}
