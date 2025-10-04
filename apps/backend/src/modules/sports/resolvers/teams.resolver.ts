/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Query, Args } from '@nestjs/graphql';
import { TeamsService } from '../services/teams.service';
import { Team } from '../entities/team.entity';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService) {}

  @Query(() => [Team])
  async teams(
    @Args('leagueId', { nullable: true }) leagueId?: string,
    @Args('country', { nullable: true }) country?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<Team[]> {
    return this.teamsService.findTeams({ leagueId, country, isActive });
  }

  @Query(() => Team, { nullable: true })
  async team(@Args('id') id: string): Promise<Team> {
    return this.teamsService.findById(id);
  }

  @Query(() => Team, { nullable: true })
  async teamBySlug(@Args('slug') slug: string): Promise<Team> {
    return this.teamsService.findBySlug(slug);
  }

  @Query(() => [Team])
  async searchTeams(
    @Args('query') query: string,
    @Args('leagueId', { nullable: true }) leagueId?: string,
  ): Promise<Team[]> {
    return this.teamsService.searchTeams(query, leagueId);
  }

  @Query(() => Team, { nullable: true })
  async teamWithDetails(
    @Args('id') id: string,
    @Args('includeStats', { nullable: true }) includeStats?: boolean,
    @Args('includeForm', { nullable: true }) includeForm?: boolean,
    @Args('includeHomeAway', { nullable: true }) includeHomeAway?: boolean,
  ): Promise<Team> {
    return this.teamsService.findTeamWithDetails(id, {
      includeStats,
      includeForm,
      includeHomeAway,
    });
  }
}
