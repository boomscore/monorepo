/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { SportsApiService } from './sports-api.service';
import { LoggerService } from '@/common/services/logger.service';

export interface MatchFilters {
  date?: string;
  leagueId?: string;
  teamId?: string;
  status?: string;
  isLive?: boolean;
  isToday?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    private readonly sportsApiService: SportsApiService,
    private readonly logger: LoggerService,
  ) {}

  async findMatches(filters: MatchFilters = {}): Promise<Match[]> {
    const {
      date,
      leagueId,
      teamId,
      status,
      isLive,
      isToday,
      limit = 20,
      offset = 0,
      sortBy = 'startTime',
      sortOrder = 'ASC',
    } = filters;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league');

    // Apply filters
    if (date) {
      if (date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        queryBuilder.andWhere('DATE(match.startTime) = :date', { date: today });
      } else {
        queryBuilder.andWhere('DATE(match.startTime) = :date', { date });
      }
    }

    if (isToday) {
      const today = new Date().toISOString().split('T')[0];
      queryBuilder.andWhere('DATE(match.startTime) = :today', { today });
    }

    if (leagueId) {
      queryBuilder.andWhere('match.leagueId = :leagueId', { leagueId });
    }

    if (teamId) {
      queryBuilder.andWhere('(match.homeTeamId = :teamId OR match.awayTeamId = :teamId)', {
        teamId,
      });
    }

    if (status) {
      queryBuilder.andWhere('match.status = :status', { status });
    }

    if (isLive) {
      queryBuilder.andWhere('match.status IN (:...liveStatuses)', {
        liveStatuses: ['LIVE', 'HALFTIME'],
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`match.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const matches = await queryBuilder.getMany();

    this.logger.info('Matches retrieved', {
      service: 'matches',
      count: matches.length,
      filters,
    });

    return matches;
  }

  async getLiveMatches(options: { leagueId?: string; limit?: number } = {}): Promise<Match[]> {
    return this.findMatches({
      isLive: true,
      leagueId: options.leagueId,
      limit: options.limit || 20,
    });
  }

  async findMatchWithDetails(
    matchId: string,
    options: { includeEvents?: boolean; includeStatistics?: boolean } = {},
  ): Promise<Match | null> {
    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.season', 'season')
      .where('match.id = :matchId', { matchId });

    if (options.includeEvents) {
      queryBuilder
        .leftJoinAndSelect('match.events', 'events')
        .leftJoinAndSelect('events.team', 'eventTeam');
    }

    const match = await queryBuilder.getOne();

    if (match) {
      this.logger.info('Match details retrieved', {
        service: 'matches',
        matchId,
        includeEvents: options.includeEvents,
        includeStatistics: options.includeStatistics,
      });
    }

    return match;
  }

  async findById(id: string): Promise<Match | null> {
    return this.matchRepository.findOne({
      where: { id },
      relations: ['homeTeam', 'awayTeam', 'league', 'season'],
    });
  }

  async updateMatchFromApi(apiData: any): Promise<Match> {
    // This would sync match data from API-Football
    // Implementation would map API data to Match entity

    let match = await this.matchRepository.findOne({
      where: { apiId: apiData.fixture.id },
      relations: ['homeTeam', 'awayTeam', 'league'],
    });

    if (!match) {
      // Create new match if doesn't exist
      match = this.matchRepository.create({
        apiId: apiData.fixture.id,
        // Map other fields from apiData
      });
    }

    // Update match data
    match.status = this.mapApiStatus(apiData.fixture.status.short);
    match.homeScore = apiData.goals.home;
    match.awayScore = apiData.goals.away;
    match.minute = apiData.fixture.status.elapsed;

    return this.matchRepository.save(match);
  }

  private mapApiStatus(apiStatus: string): MatchStatus {
    const statusMap: Record<string, MatchStatus> = {
      NS: MatchStatus.SCHEDULED,
      '1H': MatchStatus.LIVE,
      HT: MatchStatus.HALFTIME,
      '2H': MatchStatus.LIVE,
      ET: MatchStatus.LIVE,
      FT: MatchStatus.FINISHED,
      PST: MatchStatus.POSTPONED,
      CANC: MatchStatus.CANCELLED,
      ABD: MatchStatus.ABANDONED,
      SUSP: MatchStatus.SUSPENDED,
    };

    return statusMap[apiStatus] || MatchStatus.SCHEDULED;
  }

  async getTodaysMatches(): Promise<Match[]> {
    return this.findMatches({ isToday: true });
  }

  async getMatchesByDateRange(from: Date, to: Date): Promise<Match[]> {
    return this.matchRepository.find({
      where: {
        startTime: {
          $gte: from,
          $lte: to,
        } as any,
      },
      relations: ['homeTeam', 'awayTeam', 'league'],
      order: { startTime: 'ASC' },
    });
  }

  // Missing methods for resolvers
  async findLiveMatches(): Promise<Match[]> {
    return this.findMatches({ isLive: true });
  }

  async getMatchEvents(matchId: string): Promise<any[]> {
    const match = await this.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // TODO: Implement match events fetching
    return [];
  }

  async syncMatchesByDate(date: string): Promise<void> {
    // TODO: Implement sync by date
    this.logger.info('Syncing matches by date', {
      service: 'matches',
      date,
    });
  }

  async syncLiveMatches(): Promise<void> {
    // TODO: Implement live matches sync
    this.logger.info('Syncing live matches', {
      service: 'matches',
    });
  }

  async syncTeamsByLeague(leagueApiId: number, season: number): Promise<void> {
    // TODO: Implement teams sync by league
    this.logger.info('Syncing teams by league', {
      service: 'matches',
      leagueApiId,
      season,
    });
  }
}
