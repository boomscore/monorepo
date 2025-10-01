/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { LeaguesService } from '@/modules/sports/services/leagues.service';

@Injectable()
export class LeagueStandingsTool implements ChatTool {
  name = 'fetch_league_standings';
  description = 'Get current league standings/table with team positions, points, and statistics.';
  parameters = {
    type: 'object',
    properties: {
      leagueId: {
        type: 'string',
        description: 'ID of the league to get standings for',
      },
      season: {
        type: 'number',
        description: 'Season year (optional, defaults to current season)',
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 50,
        default: 20,
        description: 'Maximum number of teams to return from standings',
      },
    },
    required: ['leagueId'],
  };

  constructor(private readonly leaguesService: LeaguesService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const { leagueId, season, limit = 20 } = args;
    
    const standings = await this.leaguesService.getLeagueStandings(leagueId, {
      season,
      limit,
    });

    if (!standings) {
      throw new Error(`Standings not found for league ${leagueId}`);
    }

    return {
      league: {
        id: standings.league.id,
        name: standings.league.name,
        country: standings.league.country,
        season: season || standings.league.currentSeason,
      },
      standings: standings.teams.map((team, index) => ({
        position: index + 1,
        team: team.name,
        played: team.statistics?.played || 0,
        wins: team.statistics?.wins || 0,
        draws: team.statistics?.draws || 0,
        losses: team.statistics?.losses || 0,
        goalsFor: team.statistics?.goalsFor || 0,
        goalsAgainst: team.statistics?.goalsAgainst || 0,
        goalDifference: team.goalDifference || 0,
        points: team.statistics?.points || 0,
        form: team.currentForm,
      })),
      lastUpdated: new Date().toISOString(),
    };
  }
}
