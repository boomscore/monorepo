/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { MatchesService } from '@/modules/sports/services/matches.service';

@Injectable()
export class MatchDetailsTool implements ChatTool {
  name = 'fetch_match_details';
  description = 'Get detailed information about a specific match including events, statistics, and lineups.';
  parameters = {
    type: 'object',
    properties: {
      matchId: {
        type: 'string',
        description: 'ID of the match to get details for',
      },
      includeEvents: {
        type: 'boolean',
        default: true,
        description: 'Include match events (goals, cards, etc.)',
      },
      includeStatistics: {
        type: 'boolean',
        default: true,
        description: 'Include match statistics',
      },
    },
    required: ['matchId'],
  };

  constructor(private readonly matchesService: MatchesService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const { matchId, includeEvents = true, includeStatistics = true } = args;
    
    const match = await this.matchesService.findMatchWithDetails(matchId, {
      includeEvents,
      includeStatistics,
    });

    if (!match) {
      throw new Error(`Match with ID ${matchId} not found`);
    }

    const result: any = {
      match: {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        league: match.league.name,
        startTime: match.startTime,
        status: match.status,
        score: match.displayScore,
        venue: match.venue,
        referee: match.referee,
        attendance: match.attendance,
        weather: match.weather,
      },
    };

    if (includeEvents && match.events) {
      result.events = match.events.map(event => ({
        type: event.type,
        minute: event.displayMinute,
        player: event.player,
        team: event.team?.name,
        description: event.displayText,
        isImportant: event.isImportant,
      }));
    }

    if (includeStatistics && match.statistics) {
      result.statistics = {
        home: match.statistics.home,
        away: match.statistics.away,
      };
    }

    return result;
  }
}
