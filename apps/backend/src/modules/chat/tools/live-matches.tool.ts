/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { MatchesService } from '@/modules/sports/services/matches.service';

@Injectable()
export class LiveMatchesTool implements ChatTool {
  name = 'fetch_live_matches';
  description = 'Fetch currently live matches. Shows matches that are in progress with live scores and status.';
  parameters = {
    type: 'object',
    properties: {
      leagueId: {
        type: 'string',
        description: 'Optional: Filter live matches by specific league',
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 50,
        default: 20,
        description: 'Maximum number of live matches to return',
      },
    },
  };

  constructor(private readonly matchesService: MatchesService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const { leagueId, limit = 20 } = args;
    
    const liveMatches = await this.matchesService.getLiveMatches({
      leagueId,
      limit,
    });
    
    return {
      liveMatches: liveMatches.map(match => ({
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        league: match.league.name,
        score: match.displayScore,
        minute: match.minute,
        status: match.status,
        period: match.period,
        venue: match.venue,
        events: match.events?.slice(-3).map(event => ({
          type: event.type,
          minute: event.displayMinute,
          player: event.player,
          team: event.team?.name,
          description: event.displayText,
        })) || [],
      })),
      total: liveMatches.length,
      timestamp: new Date().toISOString(),
    };
  }
}
