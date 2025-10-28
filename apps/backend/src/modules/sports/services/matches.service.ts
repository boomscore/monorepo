import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Match, MatchStatus } from '../entities/match.entity';
import { MatchEvent, MatchEventType } from '../entities/match-event.entity';
import { Team } from '../entities/team.entity';
import { League } from '../entities/league.entity';
import { SportsApiService, ApiSportsEvent, ApiSportsMatch } from './sports-api.service';
import { LoggerService } from '@/common/services/logger.service';
import { LeagueGroup, GroupedMatchesResult, HeadToHeadStats } from '../dto/league-group.dto';

// Interfaces for API-converted entities
interface ApiConvertedTeam {
  id: string;
  name: string;
  logo?: string;
}

interface ApiConvertedLeague {
  id: string;
  name: string;
}

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
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
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

    queryBuilder.orderBy(`match.${sortBy}`, sortOrder);

    // Apply
    queryBuilder.skip(offset).take(limit);

    const matches = await queryBuilder.getMany();

    this.logger.info('Matches retrieved', {
      service: 'matches',
      count: matches.length,
      filters,
    });

    return matches;
  }

  async searchFixtures(
    query: string,
    options: {
      leagueId?: string;
      date?: string;
      isLive?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Match[]> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    const qb = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league');

    qb.where('(homeTeam.name ILIKE :q OR awayTeam.name ILIKE :q OR league.name ILIKE :q)', {
      q: `%${query}%`,
    });

    if (options.leagueId) {
      qb.andWhere('match.leagueId = :leagueId', { leagueId: options.leagueId });
    }

    if (options.date) {
      if (options.date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        qb.andWhere('DATE(match.startTime) = :date', { date: today });
      } else {
        qb.andWhere('DATE(match.startTime) = :date', { date: options.date });
      }
    }

    if (options.isLive) {
      qb.andWhere('match.status IN (:...liveStatuses)', {
        liveStatuses: ['LIVE', 'HALFTIME'],
      });
    }

    qb.orderBy('match.startTime', 'ASC').skip(offset).take(limit);

    const matches = await qb.getMany();

    this.logger.info('Search fixtures executed', {
      service: 'matches',
      query,
      count: matches.length,
      options,
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

  async findMatchesGroupedByLeague(filters: MatchFilters = {}): Promise<GroupedMatchesResult> {
    const {
      date,
      leagueId,
      teamId,
      status,
      isLive,
      isToday,
      limit = 100,
      offset = 0,
      sortBy = 'startTime',
      sortOrder = 'ASC',
    } = filters;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league');

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

    queryBuilder.orderBy('league.name', 'ASC').addOrderBy(`match.${sortBy}`, sortOrder);

    const totalMatches = await queryBuilder.getCount();

    queryBuilder.skip(offset).take(limit);

    const matches = await queryBuilder.getMany();

    const leagueGroups = new Map<string, LeagueGroup>();

    for (const match of matches) {
      const leagueId = match.league.id;

      if (!leagueGroups.has(leagueId)) {
        leagueGroups.set(leagueId, {
          league: match.league,
          matches: [],
          totalMatches: 0,
          hasLiveMatches: false,
          hasUpcomingMatches: false,
        });
      }

      const group = leagueGroups.get(leagueId)!;
      group.matches.push(match);
      group.totalMatches++;

      if (match.isLive) {
        group.hasLiveMatches = true;
      }
      if (match.isUpcoming) {
        group.hasUpcomingMatches = true;
      }
    }

    const groups = Array.from(leagueGroups.values());

    this.logger.info('Grouped matches retrieved', {
      service: 'matches',
      totalMatches: matches.length,
      totalGroups: groups.length,
      filters,
    });

    return {
      groups,
      totalMatches: matches.length,
      totalGroups: groups.length,
      hasMore: offset + matches.length < totalMatches,
    };
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

  async updateMatchFromApi(apiData: ApiSportsMatch): Promise<Match> {
    let match = await this.matchRepository.findOne({
      where: { apiId: String(apiData.fixture.id) },
      relations: ['homeTeam', 'awayTeam', 'league'],
    });

    if (!match) {
      match = this.matchRepository.create({
        apiId: String(apiData.fixture.id),
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
        startTime: Between(from, to),
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
      this.logger.error(
        'Failed to fetch or persist match events',
        error instanceof Error ? error.message : String(error),
      );
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

  async findHeadToHeadMatches(
    homeTeamId: string,
    awayTeamId: string,
    limit: number = 10,
  ): Promise<Match[]> {
    const existingMatches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where(
        '((match.homeTeamId = :team1 AND match.awayTeamId = :team2) OR (match.homeTeamId = :team2 AND match.awayTeamId = :team1))',
        { team1: homeTeamId, team2: awayTeamId },
      )
      .andWhere('match.status = :finishedStatus', {
        finishedStatus: MatchStatus.FINISHED,
      })
      .orderBy('match.startTime', 'DESC')
      .limit(limit)
      .getMany();

    if (existingMatches.length >= Math.min(limit, 20)) {
      return existingMatches;
    }

    try {
      const [homeTeam, awayTeam] = await Promise.all([
        this.teamRepository.findOne({ where: { id: homeTeamId }, select: ['id', 'apiId'] }),
        this.teamRepository.findOne({ where: { id: awayTeamId }, select: ['id', 'apiId'] }),
      ]);

      if (!homeTeam?.apiId || !awayTeam?.apiId) {
        this.logger.warn(`Missing API IDs for teams: ${homeTeamId}, ${awayTeamId}`);
        return existingMatches;
      }

      this.logger.log(`Fetching H2H data from API for teams: ${homeTeam.apiId}, ${awayTeam.apiId}`);

      const apiMatches = await this.sportsApiService.getHeadToHead(
        parseInt(homeTeam.apiId, 10),
        parseInt(awayTeam.apiId, 10),
      );

      if (apiMatches.length > 0) {
        this.logger.log(
          `Found ${apiMatches.length} H2H matches from API. Processing comprehensive stats...`,
        );

        const allConvertedMatches: Match[] = apiMatches.map(apiMatch => {
          const match = new Match();
          match.id = `api-${apiMatch.fixture.id}`;
          match.homeScore = apiMatch.goals.home;
          match.awayScore = apiMatch.goals.away;
          match.startTime = new Date(apiMatch.fixture.date);
          match.status = MatchStatus.FINISHED;

          const homeTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.home.id}`,
            name: apiMatch.teams.home.name,
            logo: apiMatch.teams.home.logo,
          };
          match.homeTeam = homeTeam as Team;

          const awayTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.away.id}`,
            name: apiMatch.teams.away.name,
            logo: apiMatch.teams.away.logo,
          };
          match.awayTeam = awayTeam as Team;

          const league: ApiConvertedLeague = {
            id: `api-${apiMatch.league.id}`,
            name: apiMatch.league.name,
          };
          match.league = league as League;

          return match;
        });

        const allMatches = [...allConvertedMatches, ...existingMatches].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        );

        return allMatches.slice(0, Math.min(limit, 10));
      }

      return existingMatches;
    } catch (error) {
      this.logger.error('Failed to fetch H2H data from API:', error);
      return existingMatches;
    }
  }

  async findHeadToHeadStats(homeTeamId: string, awayTeamId: string): Promise<HeadToHeadStats> {
    try {
      const existingMatches = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.homeTeam', 'homeTeam')
        .leftJoinAndSelect('match.awayTeam', 'awayTeam')
        .leftJoinAndSelect('match.league', 'league')
        .where(
          '((match.homeTeamId = :team1 AND match.awayTeamId = :team2) OR (match.homeTeamId = :team2 AND match.awayTeamId = :team1))',
          { team1: homeTeamId, team2: awayTeamId },
        )
        .andWhere('match.status = :finishedStatus', {
          finishedStatus: MatchStatus.FINISHED,
        })
        .orderBy('match.startTime', 'DESC')
        .getMany();

      let allMatches = existingMatches;

      if (existingMatches.length < 20) {
        const [homeTeam, awayTeam] = await Promise.all([
          this.teamRepository.findOne({ where: { id: homeTeamId }, select: ['id', 'apiId'] }),
          this.teamRepository.findOne({ where: { id: awayTeamId }, select: ['id', 'apiId'] }),
        ]);

        if (homeTeam?.apiId && awayTeam?.apiId) {
          this.logger.log(
            `Fetching comprehensive H2H data from API for teams: ${homeTeam.apiId}, ${awayTeam.apiId}`,
          );

          const apiMatches = await this.sportsApiService.getHeadToHead(
            parseInt(homeTeam.apiId, 10),
            parseInt(awayTeam.apiId, 10),
          );

          if (apiMatches.length > 0) {
            const allConvertedMatches: Match[] = apiMatches.map(apiMatch => {
              const match = new Match();
              match.id = `api-${apiMatch.fixture.id}`;
              match.homeScore = apiMatch.goals.home;
              match.awayScore = apiMatch.goals.away;
              match.homePenaltyScore = apiMatch.score?.penalty?.home || null;
              match.awayPenaltyScore = apiMatch.score?.penalty?.away || null;
              match.homeExtraTimeScore = apiMatch.score?.extratime?.home || null;
              match.awayExtraTimeScore = apiMatch.score?.extratime?.away || null;
              match.startTime = new Date(apiMatch.fixture.date);
              match.status = MatchStatus.FINISHED;
              match.minute = null;

              const homeTeam: ApiConvertedTeam = {
                id: `api-${apiMatch.teams.home.id}`,
                name: apiMatch.teams.home.name,
                logo: apiMatch.teams.home.logo,
              };
              match.homeTeam = homeTeam as Team;

              const awayTeam: ApiConvertedTeam = {
                id: `api-${apiMatch.teams.away.id}`,
                name: apiMatch.teams.away.name,
                logo: apiMatch.teams.away.logo,
              };
              match.awayTeam = awayTeam as Team;

              const league: ApiConvertedLeague = {
                id: `api-${apiMatch.league.id}`,
                name: apiMatch.league.name,
              };
              match.league = league as League;

              return match;
            });

            allMatches = [...allConvertedMatches, ...existingMatches].sort(
              (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
            );
          }
        }
      }

      const stats = allMatches.reduce(
        (acc, match) => {
          const isHomeTeamCurrentHome =
            match.homeTeam.id === homeTeamId || match.homeTeam.name.includes(homeTeamId);
          const currentHomeScore = isHomeTeamCurrentHome ? match.homeScore : match.awayScore;
          const currentAwayScore = isHomeTeamCurrentHome ? match.awayScore : match.homeScore;

          if (currentHomeScore > currentAwayScore) {
            acc.homeWins++;
          } else if (currentAwayScore > currentHomeScore) {
            acc.awayWins++;
          } else {
            acc.draws++;
          }

          acc.totalMatches++;
          acc.totalGoals += currentHomeScore + currentAwayScore;
          acc.homeGoals += currentHomeScore;
          acc.awayGoals += currentAwayScore;

          if (currentHomeScore > currentAwayScore) {
            acc.homePoints += 3;
          } else if (currentAwayScore > currentHomeScore) {
            acc.awayPoints += 3;
          } else {
            acc.homePoints += 1;
            acc.awayPoints += 1;
          }

          return acc;
        },
        {
          homeWins: 0,
          awayWins: 0,
          draws: 0,
          totalMatches: 0,
          totalGoals: 0,
          homeGoals: 0,
          awayGoals: 0,
          homePoints: 0,
          awayPoints: 0,
        },
      );

      const homeWinPercent =
        stats.totalMatches > 0 ? (stats.homeWins / stats.totalMatches) * 100 : 0;
      const drawPercent = stats.totalMatches > 0 ? (stats.draws / stats.totalMatches) * 100 : 0;
      const awayWinPercent =
        stats.totalMatches > 0 ? (stats.awayWins / stats.totalMatches) * 100 : 0;
      const avgPointsPerGame =
        stats.totalMatches > 0
          ? (stats.homePoints + stats.awayPoints) / (stats.totalMatches * 2)
          : 0;

      return {
        totalMatches: stats.totalMatches,
        homeWins: stats.homeWins,
        awayWins: stats.awayWins,
        draws: stats.draws,
        totalGoals: stats.totalGoals,
        homeGoals: stats.homeGoals,
        awayGoals: stats.awayGoals,
        homeWinPercent,
        awayWinPercent,
        drawPercent,
        avgPointsPerGame,
        recentMatches: allMatches.slice(0, 10),
      };
    } catch (error) {
      this.logger.error('Failed to fetch comprehensive H2H stats:', error);
      return {
        totalMatches: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGoals: 0,
        homeGoals: 0,
        awayGoals: 0,
        homeWinPercent: 0,
        awayWinPercent: 0,
        drawPercent: 0,
        avgPointsPerGame: 0,
        recentMatches: [],
      };
    }
  }

  async findTeamRecentMatches(teamId: string, limit: number = 5): Promise<Match[]> {
    const existingMatches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where('(match.homeTeamId = :teamId OR match.awayTeamId = :teamId)', {
        teamId,
      })
      .andWhere('match.status = :finishedStatus', {
        finishedStatus: MatchStatus.FINISHED,
      })
      .orderBy('match.startTime', 'DESC')
      .limit(limit)
      .getMany();

    if (existingMatches.length >= Math.min(limit, 10)) {
      return existingMatches;
    }

    try {
      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        select: ['id', 'apiId'],
      });

      if (!team?.apiId) {
        this.logger.warn(`Missing API ID for team: ${teamId}`);
        return existingMatches;
      }

      const apiMatches = await this.sportsApiService.getTeamRecentFixtures(
        parseInt(team.apiId, 10),
        limit,
      );

      if (apiMatches.length > 0) {
        this.logger.log(`Found ${apiMatches.length} recent matches from API. Converting...`);

        const convertedMatches: Match[] = apiMatches.map(apiMatch => {
          const match = new Match();
          match.id = `api-${apiMatch.fixture.id}`;
          match.homeScore = apiMatch.goals.home;
          match.awayScore = apiMatch.goals.away;
          match.startTime = new Date(apiMatch.fixture.date);
          match.status = MatchStatus.FINISHED;

          const homeTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.home.id}`,
            name: apiMatch.teams.home.name,
            logo: apiMatch.teams.home.logo,
          };
          match.homeTeam = homeTeam as Team;

          const awayTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.away.id}`,
            name: apiMatch.teams.away.name,
            logo: apiMatch.teams.away.logo,
          };
          match.awayTeam = awayTeam as Team;

          const league: ApiConvertedLeague = {
            id: `api-${apiMatch.league.id}`,
            name: apiMatch.league.name,
          };
          match.league = league as League;

          return match;
        });

        return [...convertedMatches, ...existingMatches].slice(0, Math.min(limit, 5));
      }

      return existingMatches;
    } catch (error) {
      this.logger.error('Failed to fetch recent matches from API:', error);
      return existingMatches;
    }
  }

  async findTeamUpcomingMatches(teamId: string, limit: number = 5): Promise<Match[]> {
    // First, check database for upcoming matches
    const existingMatches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where('(match.homeTeamId = :teamId OR match.awayTeamId = :teamId)', {
        teamId,
      })
      .andWhere('match.status = :scheduledStatus', {
        scheduledStatus: MatchStatus.SCHEDULED,
      })
      .orderBy('match.startTime', 'ASC')
      .limit(limit)
      .getMany();

    if (existingMatches.length >= Math.min(limit, 10)) {
      return existingMatches;
    }

    try {
      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        select: ['id', 'apiId'],
      });

      if (!team?.apiId) {
        this.logger.warn(`Missing API ID for team: ${teamId}`);
        return existingMatches;
      }

      this.logger.log(`Fetching next ${limit} upcoming matches for team API ID: ${team.apiId}`);

      const currentYear = new Date().getFullYear();

      const apiMatches = await this.sportsApiService.getFixtures(
        undefined,
        currentYear,
        undefined,
        false,
        undefined,
        parseInt(team.apiId, 10),
      );

      this.logger.log(
        `Raw API response: ${apiMatches.length} total matches for team ${team.apiId} in ${currentYear}`,
      );

      if (apiMatches.length > 0) {
        apiMatches.slice(0, 3).forEach((match, index) => {
          this.logger.log(
            `Sample match ${index + 1}: ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`,
          );
        });

        this.logger.log(`Found ${apiMatches.length} total matches from API. Processing...`);

        const today = new Date();
        this.logger.log(`Filtering and sorting upcoming matches after: ${today.toISOString()}`);

        const futureMatches = apiMatches
          .filter(apiMatch => {
            const matchDate = new Date(apiMatch.fixture.date);
            return matchDate > today;
          })
          .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()) // Sort by date ascending
          .slice(0, limit);

        this.logger.log(
          `After filtering and sorting: ${futureMatches.length} upcoming matches (requested: ${limit})`,
        );

        const convertedMatches: Match[] = futureMatches.map(apiMatch => {
          const match = new Match();
          match.id = `api-${apiMatch.fixture.id}`;
          match.homeScore = null;
          match.awayScore = null;
          match.startTime = new Date(apiMatch.fixture.date);
          match.status = MatchStatus.SCHEDULED;

          const homeTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.home.id}`,
            name: apiMatch.teams.home.name,
            logo: apiMatch.teams.home.logo,
          };
          match.homeTeam = homeTeam as Team;

          const awayTeam: ApiConvertedTeam = {
            id: `api-${apiMatch.teams.away.id}`,
            name: apiMatch.teams.away.name,
            logo: apiMatch.teams.away.logo,
          };
          match.awayTeam = awayTeam as Team;

          const league: ApiConvertedLeague = {
            id: `api-${apiMatch.league.id}`,
            name: apiMatch.league.name,
          };
          match.league = league as League;

          return match;
        });

        return [...convertedMatches, ...existingMatches].slice(0, Math.min(limit, 5));
      }

      return existingMatches;
    } catch (error) {
      this.logger.error('Failed to fetch upcoming matches from API:', error);
      return existingMatches;
    }
  }
}
