/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { MatchesService } from '../services/matches.service';
import { LoggerService } from '@/common/services/logger.service';

@ApiTags('Live Fixtures')
@Controller('api/fixtures')
@Public() // Make all endpoints public for livescore experience
export class FixturesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly logger: LoggerService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Get all live matches (livescore.com style)' })
  @ApiResponse({ status: 200, description: 'Live matches retrieved successfully' })
  async getLiveMatches() {
    this.logger.info('Live matches requested', {
      service: 'fixtures-controller',
    });

    try {
      const matches = await this.matchesService.getLiveMatches();
      return {
        success: true,
        data: matches,
        count: matches.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get live matches', error.stack, {
        service: 'fixtures-controller',
      });
      return {
        success: false,
        message: 'Failed to retrieve live matches',
        error: error.message,
      };
    }
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's matches" })
  @ApiResponse({ status: 200, description: "Today's matches retrieved successfully" })
  async getTodayMatches() {
    this.logger.info("Today's matches requested", {
      service: 'fixtures-controller',
    });

    try {
      const matches = await this.matchesService.getTodayMatches();
      return {
        success: true,
        data: matches,
        count: matches.length,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get today's matches", error.stack, {
        service: 'fixtures-controller',
      });
      return {
        success: false,
        message: "Failed to retrieve today's matches",
        error: error.message,
      };
    }
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming matches' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead (default: 7)',
  })
  @ApiResponse({ status: 200, description: 'Upcoming matches retrieved successfully' })
  async getUpcomingMatches(@Query('days') days: number = 7) {
    this.logger.info('Upcoming matches requested', {
      service: 'fixtures-controller',
      days,
    });

    try {
      const matches = await this.matchesService.getUpcomingMatches(days);
      return {
        success: true,
        data: matches,
        count: matches.length,
        days,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get upcoming matches', error.stack, {
        service: 'fixtures-controller',
        days,
      });
      return {
        success: false,
        message: 'Failed to retrieve upcoming matches',
        error: error.message,
      };
    }
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent finished matches' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look back (default: 3)',
  })
  @ApiResponse({ status: 200, description: 'Recent matches retrieved successfully' })
  async getRecentMatches(@Query('days') days: number = 3) {
    this.logger.info('Recent matches requested', {
      service: 'fixtures-controller',
      days,
    });

    try {
      const matches = await this.matchesService.getRecentMatches(days);
      return {
        success: true,
        data: matches,
        count: matches.length,
        days,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get recent matches', error.stack, {
        service: 'fixtures-controller',
        days,
      });
      return {
        success: false,
        message: 'Failed to retrieve recent matches',
        error: error.message,
      };
    }
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get matches for specific date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Matches for date retrieved successfully' })
  async getMatchesByDate(@Param('date') date: string) {
    this.logger.info('Matches by date requested', {
      service: 'fixtures-controller',
      date,
    });

    try {
      const matches = await this.matchesService.getMatchesByDate(date);
      return {
        success: true,
        data: matches,
        count: matches.length,
        date,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get matches by date', error.stack, {
        service: 'fixtures-controller',
        date,
      });
      return {
        success: false,
        message: `Failed to retrieve matches for ${date}`,
        error: error.message,
      };
    }
  }

  @Get('league/:leagueId')
  @ApiOperation({ summary: 'Get matches for specific league' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead/back (default: 7)',
  })
  @ApiResponse({ status: 200, description: 'League matches retrieved successfully' })
  async getLeagueMatches(@Param('leagueId') leagueId: string, @Query('days') days: number = 7) {
    this.logger.info('League matches requested', {
      service: 'fixtures-controller',
      leagueId,
      days,
    });

    try {
      const matches = await this.matchesService.getMatchesByLeague(leagueId, days);
      return {
        success: true,
        data: matches,
        count: matches.length,
        leagueId,
        days,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get league matches', error.stack, {
        service: 'fixtures-controller',
        leagueId,
        days,
      });
      return {
        success: false,
        message: `Failed to retrieve matches for league ${leagueId}`,
        error: error.message,
      };
    }
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get matches for specific team' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of matches to return (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Team matches retrieved successfully' })
  async getTeamMatches(@Param('teamId') teamId: string, @Query('limit') limit: number = 10) {
    this.logger.info('Team matches requested', {
      service: 'fixtures-controller',
      teamId,
      limit,
    });

    try {
      const matches = await this.matchesService.getMatchesByTeam(teamId, limit);
      return {
        success: true,
        data: matches,
        count: matches.length,
        teamId,
        limit,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get team matches', error.stack, {
        service: 'fixtures-controller',
        teamId,
        limit,
      });
      return {
        success: false,
        message: `Failed to retrieve matches for team ${teamId}`,
        error: error.message,
      };
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get fixtures system status' })
  @ApiResponse({ status: 200, description: 'System status retrieved successfully' })
  async getSystemStatus() {
    try {
      const [liveCount, todayCount] = await Promise.all([
        this.matchesService.getLiveMatchCount(),
        this.matchesService.getTodayMatchCount(),
      ]);

      return {
        success: true,
        status: 'operational',
        data: {
          liveMatches: liveCount,
          todayMatches: todayCount,
          lastUpdate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get system status', error.stack, {
        service: 'fixtures-controller',
      });
      return {
        success: false,
        status: 'error',
        message: 'Failed to retrieve system status',
        error: error.message,
      };
    }
  }
}
