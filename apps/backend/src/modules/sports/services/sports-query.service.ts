import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Match, MatchStatus, Team, MatchEvent, MatchEventType } from '../entities';
import { SportsApiService } from './sports-api.service';

export interface FixtureSearchResult {
  id: string;
  startTime: Date;
  status: string;
  homeTeam: string;
  awayTeam: string;
  league?: string;
  apiId?: string | null;
  homeScore?: number;
  awayScore?: number;
}

export interface MatchMetaResult {
  homeTeam: string;
  awayTeam: string;
  kickoff: string | null;
  referee: string | null;
  cards: {
    home: { yellow: number; red: number };
    away: { yellow: number; red: number };
  } | null;
}

export interface LineupResult {
  team: { name: string; logo?: string };
  coach?: { name?: string } | null;
  formation?: string | null;
  startXI: Array<{
    player: { name: string; number: number; pos: string };
  }>;
  substitutes: Array<{
    player: { name: string; number: number; pos: string };
  }>;
}

export interface GoalScorerResult {
  minute?: number;
  extraMinute?: number | null;
  player?: string | null;
  team?: string | null;
  type: 'Goal' | 'Own Goal' | 'Penalty';
}

@Injectable()
export class SportsQueryService {
  private readonly logger = new Logger(SportsQueryService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    private readonly sportsApiService: SportsApiService,
  ) {}

  /**
   * Get today's date in YYYY-MM-DD format (UTC)
   */
  private getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Normalize date input - defaults to today if not provided
   */
  private normalizeDate(date?: string): string {
    if (!date) return this.getTodayISO();
    // Ensure YYYY-MM-DD format
    return date.slice(0, 10);
  }

  /**
   * Extract team names from text using common patterns
   */
  private extractTeamNames(text: string): string[] {
    const patterns = [
      // Premier League
      /man\s*u(?:nited)?/i,
      /manchester\s*united/i,
      /manchester\s*city/i,
      /man\s*city/i,
      /liverpool/i,
      /chelsea/i,
      /arsenal/i,
      /tottenham/i,
      /brighton/i,
      /west\s*ham/i,
      /newcastle/i,
      /aston\s*villa/i,
      /crystal\s*palace/i,
      /everton/i,
      /wolves/i,
      /fulham/i,
      /brentford/i,
      /nottingham\s*forest/i,

      // Serie A
      /juventus/i,
      /inter(?:\s*milan)?/i,
      /ac\s*milan/i,
      /milan/i,
      /napoli/i,
      /roma/i,
      /lazio/i,
      /atalanta/i,
      /fiorentina/i,
      /bologna/i,
      /torino/i,
      /como(?:\s*1907)?/i,
      /genoa/i,
      /verona/i,

      // La Liga
      /real\s*madrid/i,
      /barcelona/i,
      /atletico(?:\s*madrid)?/i,
      /valencia/i,
      /sevilla/i,
      /real\s*betis/i,
      /villarreal/i,

      // Bundesliga
      /bayern(?:\s*munich)?/i,
      /borussia\s*dortmund/i,
      /dortmund/i,
      /rb\s*leipzig/i,
      /leipzig/i,
      /bayer\s*leverkusen/i,

      // Ligue 1
      /psg/i,
      /paris\s*saint.germain/i,
      /marseille/i,
      /lyon/i,
      /monaco/i,
      /lille/i,
    ];

    const foundTeams: string[] = [];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const teamName = match[0].toLowerCase().trim();
        if (!foundTeams.includes(teamName)) {
          foundTeams.push(teamName);
        }
      }
    }
    return foundTeams;
  }

  /**
   * Search fixtures by team name or league name with optional date filter
   * Defaults to today if no date provided
   */
  async searchFixtures(options: {
    teamName?: string;
    leagueName?: string;
    date?: string;
    onlyUnplayed?: boolean;
    limit?: number;
  }): Promise<FixtureSearchResult[]> {
    const date = this.normalizeDate(options.date);
    const limit = options.limit || 50;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where('DATE(match.startTime) = :date', { date });

    if (options.teamName) {
      queryBuilder.andWhere(
        '(LOWER(homeTeam.name) LIKE :teamName OR LOWER(awayTeam.name) LIKE :teamName)',
        { teamName: `%${options.teamName.toLowerCase()}%` },
      );
    }

    if (options.leagueName) {
      queryBuilder.andWhere('LOWER(league.name) LIKE :leagueName', {
        leagueName: `%${options.leagueName.toLowerCase()}%`,
      });
    }

    if (options.onlyUnplayed) {
      queryBuilder.andWhere('match.status = :status', {
        status: MatchStatus.SCHEDULED,
      });
    }

    const matches = await queryBuilder.orderBy('match.startTime', 'ASC').limit(limit).getMany();

    return matches.map(match => ({
      id: match.id,
      startTime: match.startTime,
      status: match.status,
      homeTeam: match.homeTeam?.name || 'Unknown',
      awayTeam: match.awayTeam?.name || 'Unknown',
      league: match.league?.name,
      apiId: match.apiId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    }));
  }

  /**
   * Find a specific fixture by team names and date
   */
  async findFixture(options: {
    homeTeam?: string;
    awayTeam?: string;
    date?: string;
  }): Promise<FixtureSearchResult | null> {
    const date = this.normalizeDate(options.date);

    let queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where('DATE(match.startTime) = :date', { date });

    if (options.homeTeam && options.awayTeam) {
      // Exact match or reversed
      queryBuilder.andWhere(
        '((LOWER(homeTeam.name) LIKE :home AND LOWER(awayTeam.name) LIKE :away) OR (LOWER(homeTeam.name) LIKE :away AND LOWER(awayTeam.name) LIKE :home))',
        {
          home: `%${options.homeTeam.toLowerCase()}%`,
          away: `%${options.awayTeam.toLowerCase()}%`,
        },
      );
    } else if (options.homeTeam) {
      queryBuilder.andWhere(
        '(LOWER(homeTeam.name) LIKE :team OR LOWER(awayTeam.name) LIKE :team)',
        { team: `%${options.homeTeam.toLowerCase()}%` },
      );
    }

    const match = await queryBuilder.getOne();

    if (!match) return null;

    return {
      id: match.id,
      startTime: match.startTime,
      status: match.status,
      homeTeam: match.homeTeam?.name || 'Unknown',
      awayTeam: match.awayTeam?.name || 'Unknown',
      league: match.league?.name,
      apiId: match.apiId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    };
  }

  /**
   * Get match metadata (kickoff, referee, cards)
   */
  async getMatchMeta(options: {
    homeTeam?: string;
    awayTeam?: string;
    date?: string;
  }): Promise<MatchMetaResult | null> {
    const fixture = await this.findFixture(options);
    if (!fixture) return null;

    let referee: string | null = null;
    let cards: MatchMetaResult['cards'] = null;

    // Try to get additional data from API if we have apiId
    if (fixture.apiId) {
      try {
        const fixtureId = parseInt(fixture.apiId, 10);

        // Get referee from API fixture details
        const apiFixtures = await this.sportsApiService.getFixtures(
          undefined,
          undefined,
          this.normalizeDate(options.date),
        );
        const apiFixture = apiFixtures.find(f => f.fixture.id === fixtureId);
        if (apiFixture) {
          referee = apiFixture.fixture.referee || null;
        }

        // Get cards from API statistics
        const stats = await this.sportsApiService.getMatchStatistics(fixtureId);
        if (stats.length > 0) {
          const findCards = (teamName: string) => {
            const teamStats = stats.find(
              s => s.team?.name?.toLowerCase() === teamName.toLowerCase(),
            );
            const statistics = teamStats?.statistics || [];
            const yellow = statistics.find(s => /yellow cards?/i.test(s?.type || ''))?.value || 0;
            const red = statistics.find(s => /red cards?/i.test(s?.type || ''))?.value || 0;
            return { yellow: Number(yellow), red: Number(red) };
          };

          cards = {
            home: findCards(fixture.homeTeam),
            away: findCards(fixture.awayTeam),
          };
        }
      } catch (error) {
        this.logger.warn('Failed to fetch additional match data from API:', error);
      }
    }

    return {
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      kickoff: fixture.startTime.toISOString(),
      referee,
      cards,
    };
  }

  /**
   * Get match lineups
   */
  async getLineups(options: {
    teamName?: string;
    date?: string;
    fixtureApiId?: number;
  }): Promise<LineupResult[]> {
    let fixtureId = options.fixtureApiId;

    // Find fixture if not provided
    if (!fixtureId && options.teamName) {
      const fixture = await this.findFixture({
        homeTeam: options.teamName,
        date: options.date,
      });
      if (fixture?.apiId) {
        fixtureId = parseInt(fixture.apiId, 10);
      }
    }

    if (!fixtureId) return [];

    try {
      const lineups = await this.sportsApiService.getMatchLineups(fixtureId);
      return lineups.map(lineup => ({
        team: {
          name: lineup.team?.name || 'Unknown',
          logo: lineup.team?.logo,
        },
        coach: lineup.coach,
        formation: lineup.formation,
        startXI: lineup.startXI || [],
        substitutes: lineup.substitutes || [],
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch lineups:', error);
      return [];
    }
  }

  /**
   * Get goal scorers for a match
   */
  async getGoalScorers(options: {
    teamName?: string;
    date?: string;
    fixtureApiId?: number;
  }): Promise<GoalScorerResult[]> {
    const date = this.normalizeDate(options.date);
    let fixtureId = options.fixtureApiId;

    // Try database events first
    if (options.teamName) {
      const matches = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.homeTeam', 'homeTeam')
        .leftJoinAndSelect('match.awayTeam', 'awayTeam')
        .leftJoinAndSelect('match.events', 'events')
        .leftJoinAndSelect('events.team', 'eventTeam')
        .where('DATE(match.date) = :date', { date })
        .andWhere('(LOWER(homeTeam.name) LIKE :team OR LOWER(awayTeam.name) LIKE :team)', {
          team: `%${options.teamName.toLowerCase()}%`,
        })
        .getMany();

      if (matches.length > 0) {
        const scoringEvents = matches.flatMap(match =>
          (match.events || []).filter(event =>
            [MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_GOAL].includes(
              event.type,
            ),
          ),
        );

        if (scoringEvents.length > 0) {
          return scoringEvents.map(event => ({
            minute: (event as any).minute,
            extraMinute: (event as any).extraMinute,
            player: (event as any).player,
            team: (event as any).team?.name,
            type:
              event.type === MatchEventType.OWN_GOAL
                ? 'Own Goal'
                : event.type === MatchEventType.PENALTY_GOAL
                  ? 'Penalty'
                  : 'Goal',
          }));
        }
      }
    }

    // Fallback to API if no database events
    if (!fixtureId && options.teamName) {
      const fixture = await this.findFixture({
        homeTeam: options.teamName,
        date: options.date,
      });
      if (fixture?.apiId) {
        fixtureId = parseInt(fixture.apiId, 10);
      }
    }

    if (!fixtureId) return [];

    try {
      const events = await this.sportsApiService.getMatchEvents(fixtureId);
      const goalEvents = events.filter(event =>
        ['Goal', 'Own Goal', 'Penalty'].includes(event.type),
      );

      return goalEvents.map(event => ({
        minute: event.time?.elapsed,
        extraMinute: event.time?.extra,
        player: event.player?.name,
        team: event.team?.name,
        type: event.type as 'Goal' | 'Own Goal' | 'Penalty',
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch goal scorers from API:', error);
      return [];
    }
  }

  /**
   * Clean up stale live matches (matches marked as live but actually finished)
   */
  private async cleanupStaleLiveMatches(): Promise<void> {
    try {
      // Find matches that are marked as live but should be finished
      const now = new Date();

      // Consider matches stale if they're more than 90 minutes old
      // This accounts for regular match time + extra time + delays
      const staleThreshold = new Date(now.getTime() - 90 * 60 * 1000);

      const staleMatches = await this.matchRepository.find({
        where: [
          // Matches with finished/cancelled status but still marked as live
          {
            isLive: true,
            status: In([
              MatchStatus.FINISHED,
              MatchStatus.CANCELLED,
              MatchStatus.POSTPONED,
              MatchStatus.ABANDONED,
              MatchStatus.SUSPENDED,
            ]),
          },
          // Matches marked as live but are older than the stale threshold
          // This catches matches from today and previous days
          {
            isLive: true,
            startTime: LessThan(staleThreshold),
          },
        ],
      });

      if (staleMatches.length > 0) {
        // Update them to not be live and set status to finished if still live
        await this.matchRepository.update(
          { id: In(staleMatches.map(m => m.id)) },
          {
            isLive: false,
            status: MatchStatus.FINISHED,
          },
        );

        this.logger.log(
          `Cleaned up ${staleMatches.length} stale live matches (older than 90 minutes or with finished status)`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to cleanup stale live matches:', error);
    }
  }

  /**
   * Get live matches
   */
  async getLiveMatches(): Promise<FixtureSearchResult[]> {
    // Clean up stale live matches first
    await this.cleanupStaleLiveMatches();

    const matches = await this.matchRepository.find({
      where: {
        isLive: true,
        status: In([MatchStatus.LIVE, MatchStatus.HALFTIME]),
      },
      relations: ['homeTeam', 'awayTeam', 'league'],
      order: { startTime: 'ASC' },
    });

    return matches.map(match => ({
      id: match.id,
      startTime: match.startTime,
      status: match.status,
      homeTeam: match.homeTeam?.name || 'Unknown',
      awayTeam: match.awayTeam?.name || 'Unknown',
      league: match.league?.name,
      apiId: match.apiId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    }));
  }

  /**
   * Parse date from natural language text
   */
  parseDateFromText(text: string): string | null {
    // ISO format: YYYY-MM-DD
    const isoMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // US format: MM/DD/YYYY
    const usMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (usMatch) {
      const [, month, day, year] = usMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Month names
    const monthNames = {
      january: '01',
      jan: '01',
      february: '02',
      feb: '02',
      march: '03',
      mar: '03',
      april: '04',
      apr: '04',
      may: '05',
      june: '06',
      jun: '06',
      july: '07',
      jul: '07',
      august: '08',
      aug: '08',
      september: '09',
      sep: '09',
      sept: '09',
      october: '10',
      oct: '10',
      november: '11',
      nov: '11',
      december: '12',
      dec: '12',
    };

    const monthMatch = text.match(
      /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{1,2}),?\s+(\d{4})/i,
    );
    if (monthMatch) {
      const [, monthName, day, year] = monthMatch;
      const month = monthNames[monthName.toLowerCase() as keyof typeof monthNames];
      if (month) {
        return `${year}-${month}-${day.padStart(2, '0')}`;
      }
    }

    return null;
  }

  /**
   * Extract teams from text and find fixture
   */
  async findFixtureFromText(text: string, date?: string): Promise<FixtureSearchResult | null> {
    const teams = this.extractTeamNames(text);
    const parsedDate = this.parseDateFromText(text) || date;

    if (teams.length >= 2) {
      return this.findFixture({
        homeTeam: teams[0],
        awayTeam: teams[1],
        date: parsedDate,
      });
    } else if (teams.length === 1) {
      return this.findFixture({
        homeTeam: teams[0],
        date: parsedDate,
      });
    }

    return null;
  }
}
