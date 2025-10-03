import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface ApiSportsConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export interface ApiSportsResponse<T = any> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

export interface ApiSportsLeague {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export interface ApiSportsTeam {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

export interface ApiSportsFixture {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number;
    second: number;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
}

export interface ApiSportsMatch {
  fixture: ApiSportsFixture;
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: ApiSportsTeam;
    away: ApiSportsTeam;
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

export interface ApiSportsEvent {
  time: {
    elapsed: number;
    extra: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number;
    name: string;
  };
  type: string;
  detail: string;
  comments: string;
}

export interface ApiSportsOdds {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  update: string;
  bookmakers: Array<{
    id: number;
    name: string;
    bets: Array<{
      id: number;
      name: string;
      values: Array<{
        value: string;
        odd: string;
      }>;
    }>;
  }>;
}

export interface ApiSportsStandingsTeam {
  rank: number;
  team: { id: number; name: string; logo?: string };
  points: number;
  goalsDiff?: number;
  all?: { played: number; win: number; draw: number; lose: number };
}

export interface ApiSportsStandingsLeague {
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
    standings: ApiSportsStandingsTeam[][]; // groups
  };
}

export interface ApiSportsLineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

export interface ApiSportsLineupTeam {
  id: number;
  name: string;
  logo: string;
  colors?: Record<string, unknown>;
}

export interface ApiSportsLineup {
  team: ApiSportsLineupTeam;
  coach?: { id?: number; name?: string } | null;
  formation?: string | null;
  startXI: ApiSportsLineupPlayer[];
  substitutes: ApiSportsLineupPlayer[];
}

@Injectable()
export class SportsApiService {
  private readonly logger = new Logger(SportsApiService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: ApiSportsConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      baseUrl: 'https://v3.football.api-sports.io',
      apiKey: this.configService.get<string>('SPORT_API_KEY') || '',
      timeout: 30000,
    };

    if (!this.config.apiKey) {
      this.logger.warn(
        'SPORT_API_KEY not configured. Sports data ingestion will be disabled.',
      );
    }

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'X-RapidAPI-Key': this.config.apiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io',
      },
    });

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error: any) => {
        this.logger.error('API Request Error:', error);
        return Promise.reject(new Error(String(error)));
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `API Response: ${response.status} - ${(response.data as { results?: number })?.results || 0} results`,
        );
        return response;
      },
      (error: any) => {
        this.logger.error('API Response Error:', {
          status: (error as { response?: { status?: number } }).response
            ?.status,
          message: (error as Error).message,
          url: (error as { config?: { url?: string } }).config?.url,
        });
        return Promise.reject(new Error(String(error)));
      },
    );
  }

  async getLeagues(season?: number): Promise<ApiSportsLeague[]> {
    try {
      const params: Record<string, string | number> = {};
      if (season) params.season = season;

      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsLeague>
      >('/leagues', { params });

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch leagues:', error);
      return [];
    }
  }

  async getTeams(leagueId: number, season: number): Promise<ApiSportsTeam[]> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<{ team: ApiSportsTeam }>
      >('/teams', {
        params: {
          league: leagueId,
          season: season,
        },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors:', response.data.errors);
        return [];
      }

      return response.data.response.map((item) => item.team);
    } catch (error) {
      this.logger.error('Failed to fetch teams:', error);
      return [];
    }
  }

  async getFixtures(
    leagueId?: number,
    season?: number,
    date?: string,
    live?: boolean,
    fixtureId?: number,
  ): Promise<ApiSportsMatch[]> {
    try {
      const params: Record<string, string | number> = {};
      if (leagueId) params.league = leagueId;
      if (season) params.season = season;
      if (date) params.date = date;
      if (live) params.live = 'all';
      if (fixtureId) params.id = fixtureId;

      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsMatch>
      >('/fixtures', { params });

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch fixtures:', error);
      return [];
    }
  }

  async getFixtureById(fixtureId: number): Promise<ApiSportsMatch | null> {
    const fixtures = await this.getFixtures(
      undefined,
      undefined,
      undefined,
      undefined,
      fixtureId,
    );
    return fixtures.length > 0 ? fixtures[0] : null;
  }

  async getLiveMatches(): Promise<ApiSportsMatch[]> {
    return this.getFixtures(undefined, undefined, undefined, true);
  }

  async getTodayMatches(): Promise<ApiSportsMatch[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getFixtures(undefined, undefined, today);
  }

  async getMatchEvents(fixtureId: number): Promise<ApiSportsEvent[]> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsEvent>
      >('/fixtures/events', {
        params: {
          fixture: fixtureId,
        },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch match events:', error);
      return [];
    }
  }

  async getMatchStatistics(fixtureId: number): Promise<any[]> {
    try {
      const response = await this.httpClient.get<ApiSportsResponse<any>>(
        '/fixtures/statistics',
        {
          params: {
            fixture: fixtureId,
          },
        },
      );

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch match statistics:', error);
      return [];
    }
  }

  async getMatchLineups(fixtureId: number): Promise<ApiSportsLineup[]> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsLineup>
      >('/fixtures/lineups', {
        params: {
          fixture: fixtureId,
        },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('API Errors (lineups):', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch match lineups:', error);
      return [];
    }
  }

  // Basketball API methods (using different base URL)
  async getBasketballLeagues(): Promise<any[]> {
    try {
      // Switch to basketball API
      const basketballClient = axios.create({
        baseURL: 'https://v1.basketball.api-sports.io',
        timeout: this.config.timeout,
        headers: {
          'X-RapidAPI-Key': this.config.apiKey,
          'X-RapidAPI-Host': 'v1.basketball.api-sports.io',
        },
      });

      const response =
        await basketballClient.get<ApiSportsResponse<any>>('/leagues');

      if (response.data.errors.length > 0) {
        this.logger.error('Basketball API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch basketball leagues:', error);
      return [];
    }
  }

  async getBasketballGames(
    leagueId?: number,
    season?: number,
    live?: boolean,
  ): Promise<any[]> {
    try {
      const basketballClient = axios.create({
        baseURL: 'https://v1.basketball.api-sports.io',
        timeout: this.config.timeout,
        headers: {
          'X-RapidAPI-Key': this.config.apiKey,
          'X-RapidAPI-Host': 'v1.basketball.api-sports.io',
        },
      });

      const params: Record<string, string | number> = {};
      if (leagueId) params.league = leagueId;
      if (season) params.season = season;
      if (live) params.live = 'all';

      const response = await basketballClient.get<ApiSportsResponse<unknown>>(
        '/games',
        { params },
      );

      if (response.data.errors.length > 0) {
        this.logger.error('Basketball API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch basketball games:', error);
      return [];
    }
  }

  // Utility methods
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async getMatchOdds(fixtureId: number): Promise<ApiSportsOdds[]> {
    if (!this.isConfigured()) {
      throw new Error('Sports API is not configured');
    }

    try {
      const params: Record<string, string | number> = {
        fixture: fixtureId,
      };

      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsOdds>
      >('/odds', { params });

      if (response.data.errors.length > 0) {
        this.logger.error('Odds API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch odds for fixture ${fixtureId}:`,
        error,
      );
      return Promise.reject(new Error(String(error)));
    }
  }

  async getBulkMatchOdds(
    fixtureIds: number[],
  ): Promise<Record<number, ApiSportsOdds[]>> {
    if (!this.isConfigured()) {
      throw new Error('Sports API is not configured');
    }

    const oddsMap: Record<number, ApiSportsOdds[]> = {};

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < fixtureIds.length; i += batchSize) {
      const batch = fixtureIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (fixtureId) => {
        try {
          const odds = await this.getMatchOdds(fixtureId);
          return { fixtureId, odds };
        } catch (error) {
          this.logger.warn(
            `Failed to fetch odds for fixture ${fixtureId}:`,
            error,
          );
          return { fixtureId, odds: [] };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        oddsMap[result.fixtureId] = result.odds;
      }

      // Small delay between batches to respect rate limits
      if (i + batchSize < fixtureIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return oddsMap;
  }

  async getBasketballMatchOdds(fixtureId: number): Promise<ApiSportsOdds[]> {
    if (!this.isConfigured()) {
      throw new Error('Sports API is not configured');
    }

    try {
      const params: Record<string, string | number> = {
        fixture: fixtureId,
      };

      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsOdds>
      >('/odds', { params });

      if (response.data.errors.length > 0) {
        this.logger.error('Basketball Odds API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch basketball odds for fixture ${fixtureId}:`,
        error,
      );
      return [];
    }
  }

  async getBasketballTeamStats(
    fixtureId: number,
  ): Promise<Record<string, number>> {
    if (!this.isConfigured()) {
      throw new Error('Sports API is not configured');
    }

    try {
      // For basketball, we can get team statistics from the fixture details
      const params: Record<string, string | number> = {
        id: fixtureId,
      };

      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsFixture>
      >('/fixtures', { params });

      if (response.data.errors.length > 0) {
        this.logger.error('Basketball Stats API Errors:', response.data.errors);
        return {};
      }

      const fixture = response.data.response[0];
      if (!fixture) {
        return {};
      }

      // Extract basic stats from fixture data
      // In a real implementation, you'd call a dedicated basketball stats endpoint
      return {
        // Basic game info
        fixtureId: fixture.id,
        elapsed: fixture.status?.elapsed || 0,
        // Basketball-specific stats (would come from dedicated endpoints)
        homePace: 100, // Default pace value - possessions per game
        awayPace: 100, // Default pace value
        homeOffRating: 110, // Default offensive rating - points per 100 possessions
        awayOffRating: 110, // Default offensive rating
        homeDefRating: 105, // Default defensive rating - points allowed per 100 possessions
        awayDefRating: 105, // Default defensive rating
        homeNetRating: 5, // Offensive - Defensive rating
        awayNetRating: 5, // Offensive - Defensive rating
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch basketball stats for fixture ${fixtureId}:`,
        error,
      );
      return {};
    }
  }

  async getTodaysFixtures(): Promise<ApiSportsMatch[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getFixtures(undefined, undefined, today);
  }

  async getStandings(
    leagueId: number,
    season: number,
  ): Promise<ApiSportsStandingsLeague | null> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsStandingsLeague>
      >('/standings', {
        params: { league: leagueId, season },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('Standings API Errors:', response.data.errors);
        return null;
      }

      return response.data.response[0] || null;
    } catch (error) {
      this.logger.error('Failed to fetch standings:', error);
      return null;
    }
  }

  async getHeadToHead(
    team1Id: number,
    team2Id: number,
  ): Promise<ApiSportsMatch[]> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsMatch>
      >('/fixtures/headtohead', {
        params: {
          h2h: `${team1Id}-${team2Id}`,
        },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('H2H API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch head-to-head data:', error);
      return [];
    }
  }

  async getTeamStatistics(
    teamId: number,
    leagueId: number,
    season: number,
  ): Promise<any> {
    try {
      const response = await this.httpClient.get<ApiSportsResponse<any>>(
        '/teams/statistics',
        {
          params: {
            team: teamId,
            league: leagueId,
            season: season,
          },
        },
      );

      if (response.data.errors.length > 0) {
        this.logger.error('Team Stats API Errors:', response.data.errors);
        return null;
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch team statistics:', error);
      return null;
    }
  }

  async getTeamRecentFixtures(
    teamId: number,
    last: number = 10,
  ): Promise<ApiSportsMatch[]> {
    try {
      const response = await this.httpClient.get<
        ApiSportsResponse<ApiSportsMatch>
      >('/fixtures', {
        params: {
          team: teamId,
          last: last,
        },
      });

      if (response.data.errors.length > 0) {
        this.logger.error('Recent Fixtures API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch recent fixtures:', error);
      return [];
    }
  }

  async getInjuries(fixtureId?: number, teamId?: number): Promise<any[]> {
    try {
      const params: Record<string, number> = {};
      if (fixtureId) params.fixture = fixtureId;
      if (teamId) params.team = teamId;

      const response = await this.httpClient.get<ApiSportsResponse<any>>(
        '/injuries',
        { params },
      );

      if (response.data.errors.length > 0) {
        this.logger.error('Injuries API Errors:', response.data.errors);
        return [];
      }

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to fetch injuries:', error);
      return [];
    }
  }

  getApiStatus(): { configured: boolean; baseUrl: string } {
    return {
      configured: this.isConfigured(),
      baseUrl: this.config.baseUrl,
    };
  }
}
