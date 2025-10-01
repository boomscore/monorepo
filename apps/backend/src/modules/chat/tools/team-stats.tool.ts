/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { TeamsService } from '@/modules/sports/services/teams.service';

@Injectable()
export class TeamStatsTool implements ChatTool {
  name = 'fetch_team_stats';
  description = 'Get comprehensive statistics for a team including recent form, league position, and performance metrics.';
  parameters = {
    type: 'object',
    properties: {
      teamId: {
        type: 'string',
        description: 'ID of the team to get statistics for',
      },
      season: {
        type: 'number',
        description: 'Season year (optional, defaults to current season)',
      },
      includeForm: {
        type: 'boolean',
        default: true,
        description: 'Include recent form and match results',
      },
      includeHomeAway: {
        type: 'boolean',
        default: true,
        description: 'Include separate home and away statistics',
      },
    },
    required: ['teamId'],
  };

  constructor(private readonly teamsService: TeamsService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const { teamId, season, includeForm = true, includeHomeAway = true } = args;
    
    const team = await this.teamsService.findTeamWithStats(teamId, {
      season,
      includeForm,
      includeHomeAway,
    });

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    const result: any = {
      team: {
        id: team.id,
        name: team.name,
        league: team.league.name,
        country: team.country,
        venue: team.venue,
        founded: team.founded,
      },
      statistics: team.statistics,
    };

    if (includeForm && team.form) {
      result.recentForm = {
        form: team.currentForm,
        lastMatches: team.form.slice(-5),
      };
    }

    if (team.statistics) {
      result.performance = {
        winRate: team.winRate,
        goalDifference: team.goalDifference,
        averageGoalsFor: team.statistics.goalsFor / (team.statistics.played || 1),
        averageGoalsAgainst: team.statistics.goalsAgainst / (team.statistics.played || 1),
      };
    }

    return result;
  }
}
