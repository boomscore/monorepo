import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Match, MatchStatus } from '../entities/match.entity';
import { MatchEvent, MatchEventType } from '../entities/match-event.entity';
import { SportsApiService, ApiSportsEvent } from './sports-api.service';
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

  async getTodayMatches(): Promise<Match[]> {
    return this.findMatches({
      isToday: true,
      limit: 50,
      sortBy: 'startTime',
      sortOrder: 'ASC',
    });
  }

  async getUpcomingMatches(days: number = 7): Promise<Match[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.startTime > :now', { now: new Date() })
      .andWhere('match.startTime <= :endDate', { endDate })
      .andWhere('match.status = :status', { status: MatchStatus.SCHEDULED })
      .orderBy('match.startTime', 'ASC')
      .limit(50);

    return queryBuilder.getMany();
  }

  async getRecentMatches(days: number = 3): Promise<Match[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.startTime >= :startDate', { startDate })
      .andWhere('match.startTime < :now', { now: new Date() })
      .andWhere('match.status = :status', { status: MatchStatus.FINISHED })
      .orderBy('match.startTime', 'DESC')
      .limit(30);

    return queryBuilder.getMany();
  }

  async getMatchesByDate(date: string): Promise<Match[]> {
    return this.findMatches({
      date,
      limit: 100,
      sortBy: 'startTime',
      sortOrder: 'ASC',
    });
  }

  async getMatchesByLeague(leagueId: string, days: number = 7): Promise<Match[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.leagueId = :leagueId', { leagueId })
      .andWhere('match.startTime >= :startDate', { startDate })
      .andWhere('match.startTime <= :endDate', { endDate })
      .orderBy('match.startTime', 'ASC')
      .limit(50);

    return queryBuilder.getMany();
  }

  async getMatchesByTeam(teamId: string, limit: number = 10): Promise<Match[]> {
    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .where('match.homeTeamId = :teamId OR match.awayTeamId = :teamId', { teamId })
      .orderBy('match.startTime', 'DESC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  async getLiveMatchCount(): Promise<number> {
    return this.matchRepository.count({
      where: [{ status: MatchStatus.LIVE }, { status: MatchStatus.HALFTIME }],
    });
  }

  async getTodayMatchCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today + 'T00:00:00.000Z');
    const endOfDay = new Date(today + 'T23:59:59.999Z');

    return this.matchRepository.count({
      where: {
        startTime: Between(startOfDay, endOfDay),
      },
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
    let match = await this.matchRepository.findOne({
      where: { apiId: apiData.fixture.id },
      relations: ['homeTeam', 'awayTeam', 'league'],
    });

    if (!match) {
      match = this.matchRepository.create({
        apiId: apiData.fixture.id,
      });
    }

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

  async findLiveMatches(): Promise<Match[]> {
    return this.findMatches({ isLive: true });
  }

  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    const match = await this.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const existingEvents = await this.matchEventRepository.find({
      where: { matchId: match.id },
      relations: ['team'],
      order: { minute: 'ASC', createdAt: 'ASC' },
    });

    if (existingEvents.length > 0) {
      return existingEvents;
    }

    const fixtureApiId = parseInt(match.apiId, 10);
    if (Number.isNaN(fixtureApiId)) {
      this.logger.warn(`Cannot fetch events: invalid match.apiId ${match.apiId} for ${match.id}`);
      return [];
    }

    try {
      const apiEvents = await this.sportsApiService.getMatchEvents(fixtureApiId);

      if (!apiEvents || apiEvents.length === 0) {
        return [];
      }

      const eventsToSave: MatchEvent[] = [];

      for (const apiEvent of apiEvents) {
        const isHome = apiEvent.team?.id?.toString() === match.homeTeam?.apiId;
        const isAway = apiEvent.team?.id?.toString() === match.awayTeam?.apiId;

        const eventEntity = this.matchEventRepository.create({
          matchId: match.id,
          teamId: isHome ? match.homeTeam?.id : isAway ? match.awayTeam?.id : undefined,
          type: this.mapApiEventType(apiEvent),
          minute: apiEvent.time?.elapsed ?? 0,
          extraTime: apiEvent.time?.extra ?? undefined,
          playerName: apiEvent.player?.name ?? undefined,
          assistPlayerName: apiEvent.assist?.name ?? undefined,
          detail: apiEvent.detail ?? undefined,
          description: apiEvent.comments ?? undefined,
          isHome: !!isHome,
          apiEventId: undefined,
          metadata: undefined,
        });

        eventsToSave.push(eventEntity);
      }

      if (eventsToSave.length > 0) {
        await this.matchEventRepository.save(eventsToSave);
      }

      return this.matchEventRepository.find({
        where: { matchId: match.id },
        relations: ['team'],
        order: { minute: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch or persist match events', error as any);
      return [];
    }
  }

  private mapApiEventType(apiEvent: ApiSportsEvent): MatchEventType {
    const type = (apiEvent.type || '').toLowerCase();
    const detail = (apiEvent.detail || '').toLowerCase();

    if (type === 'goal') {
      if (detail === 'own goal') return MatchEventType.OWN_GOAL;
      if (detail === 'penalty') return MatchEventType.PENALTY_GOAL;
      if (detail === 'missed penalty') return MatchEventType.MISSED_PENALTY;
      return MatchEventType.GOAL;
    }

    if (type === 'card') {
      if (detail === 'red card') return MatchEventType.RED_CARD;
      return MatchEventType.YELLOW_CARD;
    }

    if (type === 'subst') return MatchEventType.SUBSTITUTION;
    if (type === 'var') return MatchEventType.VAR;

    return MatchEventType.GOAL;
  }
}
