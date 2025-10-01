/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { MatchesService } from '@/modules/sports/services/matches.service';

@Injectable()
export class MatchesTool implements ChatTool {
  name = 'fetch_matches';
  description = 'Fetch matches by date, league, or team. Useful for finding specific matches or getting match schedules.';
  parameters = {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date',
        description: 'Date to fetch matches for (YYYY-MM-DD format). Use "today" for current date.',
      },
      leagueId: {
        type: 'string',
        description: 'League ID to filter matches by specific league',
      },
      teamId: {
        type: 'string',
        description: 'Team ID to filter matches by specific team',
      },
      status: {
        type: 'string',
        enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'],
        description: 'Match status to filter by',
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Maximum number of matches to return',
      },
    },
    anyOf: [
      { required: ['date'] },
      { required: ['leagueId'] },
      { required: ['teamId'] },
    ],
  };

  constructor(private readonly matchesService: MatchesService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const { date, leagueId, teamId, status, limit = 10 } = args;
    
    // Convert "today" to actual date
    const searchDate = date === 'today' ? new Date().toISOString().split('T')[0] : date;
    
    const filters = {
      date: searchDate,
      leagueId,
      teamId,
      status,
      limit,
    };

    const matches = await this.matchesService.findMatches(filters);
    
    // Format matches for chat response
    return {
      matches: matches.map(match => ({
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        league: match.league.name,
        startTime: match.startTime,
        status: match.status,
        score: match.displayScore,
        venue: match.venue,
      })),
      total: matches.length,
      searchCriteria: filters,
    };
  }
}
