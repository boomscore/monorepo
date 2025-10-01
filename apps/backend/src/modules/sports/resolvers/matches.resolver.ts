/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { MatchesService, MatchFilters } from '../services/matches.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';

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
    if (isLive) filters.isLive = isLive;
    if (isToday) filters.isToday = isToday;
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    return this.matchesService.findMatches(filters);
  }

  @Query(() => Match, { nullable: true })
  async match(@Args('id') id: string): Promise<Match> {
    return this.matchesService.findById(id);
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

  // Admin mutations
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncTodayMatches(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    await this.matchesService.syncMatchesByDate(today);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncLiveMatches(): Promise<boolean> {
    await this.matchesService.syncLiveMatches();
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async syncTeams(
    @Args('leagueApiId') leagueApiId: number,
    @Args('season') season: number,
  ): Promise<boolean> {
    await this.matchesService.syncTeamsByLeague(leagueApiId, season);
    return true;
  }
}
