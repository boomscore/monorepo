/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Query, Args } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { LeaguesService } from '../services/leagues.service';
import { League } from '../entities/league.entity';

@Resolver(() => League)
export class LeaguesResolver {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Query(() => [League])
  async leagues(
    @Args('sportId', { nullable: true }) sportId?: string,
    @Args('country', { nullable: true }) country?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<League[]> {
    return this.leaguesService.findLeagues({ sportId, country, isActive });
  }

  @Query(() => League, { nullable: true })
  async league(@Args('id') id: string): Promise<League> {
    return this.leaguesService.findById(id);
  }

  @Query(() => League, { nullable: true })
  async leagueBySlug(@Args('slug') slug: string): Promise<League> {
    return this.leaguesService.findBySlug(slug);
  }

  @Query(() => [League])
  async popularLeagues(): Promise<League[]> {
    return this.leaguesService.findPopularLeagues();
  }

  @Query(() => [League])
  async searchLeagues(
    @Args('query') query: string,
    @Args('sportId', { nullable: true }) sportId?: string,
  ): Promise<League[]> {
    return this.leaguesService.searchLeagues(query, sportId);
  }

  @Query(() => GraphQLJSON, { nullable: true })
  async leagueStandings(
    @Args('leagueId') leagueId: string,
    @Args('season', { nullable: true }) season?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ) {
    return this.leaguesService.getLeagueStandings(leagueId, { season, limit });
  }
}
