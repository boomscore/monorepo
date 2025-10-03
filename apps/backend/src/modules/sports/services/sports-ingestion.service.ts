import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Sport,
  SportType,
  League,
  LeagueType,
  Season,
  Team,
  Match,
  MatchStatus,
  MatchEvent,
  MatchEventType,
} from '../entities';

import {
  SportsApiService,
  ApiSportsLeague,
  ApiSportsTeam,
  ApiSportsMatch,
  ApiSportsEvent,
} from './sports-api.service';

@Injectable()
export class SportsIngestionService {
  private readonly logger = new Logger(SportsIngestionService.name);

  constructor(
    private sportsApiService: SportsApiService,
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    @InjectRepository(League)
    private leagueRepository: Repository<League>,
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchEvent)
    private matchEventRepository: Repository<MatchEvent>,
  ) {}

  private generateLeagueSlug(name: string, apiId: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${base}-${apiId}`;
  }

  private generateTeamSlug(name: string, apiId: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${base}-${apiId}`;
  }

  async initializeSports(): Promise<void> {
    this.logger.log('Initializing sports data...');

    try {
      // Create Football sport if it doesn't exist
      let footballSport = await this.sportRepository.findOne({
        where: { slug: 'football' },
      });

      if (!footballSport) {
        footballSport = this.sportRepository.create({
          name: 'Football',
          slug: 'football',
          description: 'Association Football (Soccer)',
          isActive: true,
          sortOrder: 1,
          apiId: '1',
        });
        await this.sportRepository.save(footballSport);
        this.logger.log('Created Football sport');
      }

      // Create Basketball sport if it doesn't exist
      let basketballSport = await this.sportRepository.findOne({
        where: { slug: 'basketball' },
      });

      if (!basketballSport) {
        basketballSport = this.sportRepository.create({
          name: 'Basketball',
          slug: 'basketball',
          description: 'Professional Basketball',
          isActive: true,
          sortOrder: 2,
          apiId: '2',
        });
        await this.sportRepository.save(basketballSport);
        this.logger.log('Created Basketball sport');
      }

      this.logger.log('Sports initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize sports:', error);
    }
  }

  async syncLeagues(): Promise<void> {
    if (!this.sportsApiService.isConfigured()) {
      this.logger.warn('Sports API not configured, skipping league sync');
      return;
    }

    this.logger.log('Starting league synchronization...');

    try {
      const footballSport = await this.sportRepository.findOne({
        where: { slug: 'football' },
      });

      if (!footballSport) {
        this.logger.error('Football sport not found');
        return;
      }

      // Fetch leagues from API
      const apiLeagues = await this.sportsApiService.getLeagues();
      this.logger.log(`Fetched ${apiLeagues.length} leagues from API`);

      // Focus on major leagues for now (defensive against missing fields)
      // REMOVED: No longer filtering to major leagues only - giving users access to all football data
      // const majorLeagues = apiLeagues.filter(league => this.isMajorLeague(league?.league?.name));

      this.logger.log(
        `🌍 Processing ALL ${apiLeagues.length} leagues for comprehensive football data coverage`,
      );

      let syncedCount = 0;
      let errorCount = 0;

      // Process leagues in batches to avoid overwhelming the system
      const batchSize = 50; // Process 50 leagues at a time
      for (let i = 0; i < apiLeagues.length; i += batchSize) {
        const batch = apiLeagues.slice(i, i + batchSize);
        this.logger.log(
          `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(apiLeagues.length / batchSize)} (${batch.length} leagues)`,
        );

        for (const apiLeague of batch) {
          try {
            if (apiLeague?.league?.id && apiLeague?.league?.name) {
              const league = await this.syncLeague(apiLeague, footballSport);
              if (league) {
                syncedCount++;
                if (syncedCount % 10 === 0) {
                  // Log every 10th league to avoid spam
                  this.logger.log(`✅ Progress: ${syncedCount} leagues synced so far...`);
                }
              }
            } else {
              this.logger.debug(`⚠️ Skipping league with missing data`);
            }
          } catch (error) {
            this.logger.error(`❌ Failed to sync league ${apiLeague?.league?.name}:`, error);
            errorCount++;
          }
        }

        // Add a small delay between batches to respect API rate limits
        if (i + batchSize < apiLeagues.length) {
          this.logger.log(
            `⏳ Pausing between batches... (${syncedCount} synced, ${errorCount} errors)`,
          );
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
        }
      }

      this.logger.log(
        `🎉 League synchronization completed! Successfully synced ${syncedCount} leagues with ${errorCount} errors out of ${apiLeagues.length} total leagues`,
      );
    } catch (error) {
      this.logger.error('Failed to sync leagues:', error);
    }
  }

  private async syncLeague(apiLeague: ApiSportsLeague, sport: Sport): Promise<League | null> {
    try {
      let league = await this.leagueRepository.findOne({
        where: { apiId: apiLeague?.league?.id?.toString() },
      });

      if (!league) {
        league = this.leagueRepository.create({
          name: apiLeague?.league?.name || 'Unknown League',
          slug: this.generateLeagueSlug(
            apiLeague?.league?.name || 'unknown',
            apiLeague?.league?.id?.toString() || '0',
          ),
          type: this.mapLeagueType(apiLeague?.league?.type),
          country: apiLeague?.country?.name || 'Unknown',
          countryCode: apiLeague?.country?.code,
          logo: apiLeague?.league?.logo,
          flag: apiLeague?.country?.flag,
          apiId: apiLeague?.league?.id?.toString() || '0',
          sportId: sport.id,
          sortOrder: this.getLeaguePriority(apiLeague?.league?.name),
        });

        await this.leagueRepository.save(league);
        this.logger.debug(`Created league: ${league.name}`);
      } else {
        // Update existing league
        league.name = apiLeague?.league?.name || league.name;
        league.logo = apiLeague?.league?.logo ?? league.logo;
        league.flag = apiLeague?.country?.flag ?? league.flag;
        await this.leagueRepository.save(league);
      }

      // Sync seasons for this league
      if (apiLeague?.seasons && apiLeague.seasons.length > 0) {
        await this.syncSeasons(apiLeague.seasons, league);
      }

      return league;
    } catch (error) {
      this.logger.error(`Failed to sync league ${apiLeague.league?.name}:`, error);
      return null;
    }
  }

  private async syncSeasons(
    apiSeasons: Array<{
      year: number;
      start: string;
      end: string;
      current: boolean;
    }>,
    league: League,
  ): Promise<void> {
    for (const apiSeason of apiSeasons) {
      try {
        let season = await this.seasonRepository.findOne({
          where: {
            leagueId: league.id,
            year: apiSeason.year,
          },
        });

        if (!season) {
          season = this.seasonRepository.create({
            year: apiSeason.year,
            startDate: new Date(apiSeason.start),
            endDate: new Date(apiSeason.end),
            isCurrent: apiSeason.current,
            leagueId: league.id,
          });

          await this.seasonRepository.save(season);
          this.logger.debug(`Created season ${apiSeason.year} for ${league.name}`);
        } else {
          // Update current season status
          season.isCurrent = apiSeason.current;
          await this.seasonRepository.save(season);
        }
      } catch (error) {
        this.logger.error(`Failed to sync season ${apiSeason.year} for ${league.name}:`, error);
      }
    }
  }

  async syncTeams(leagueApiId: string, season: number): Promise<void> {
    if (!this.sportsApiService.isConfigured()) {
      this.logger.warn('Sports API not configured, skipping team sync');
      return;
    }

    try {
      const league = await this.leagueRepository.findOne({
        where: { apiId: leagueApiId },
      });

      if (!league) {
        this.logger.error(`League with API ID ${leagueApiId} not found`);
        return;
      }

      const apiTeams = await this.sportsApiService.getTeams(parseInt(leagueApiId), season);
      this.logger.log(`Fetched ${apiTeams.length} teams for ${league.name}`);

      for (const apiTeam of apiTeams) {
        await this.syncTeam(apiTeam, league);
      }

      this.logger.log(`Team synchronization completed for ${league.name}`);
    } catch (error) {
      this.logger.error('Failed to sync teams:', error);
    }
  }

  private async syncTeam(apiTeam: ApiSportsTeam, league: League): Promise<Team | null> {
    try {
      let team = await this.teamRepository.findOne({
        where: { apiId: apiTeam.id.toString() },
      });

      if (!team) {
        team = this.teamRepository.create({
          name: apiTeam.name,
          slug: this.generateTeamSlug(apiTeam.name, apiTeam.id.toString()),
          code: apiTeam.code,
          logo: apiTeam.logo,
          country: apiTeam.country,
          founded: apiTeam.founded,
          apiId: apiTeam.id.toString(),
          leagueId: league.id,
        });

        await this.teamRepository.save(team);
        this.logger.debug(`Created team: ${team.name}`);
      } else {
        // Update existing team
        team.name = apiTeam.name;
        team.logo = apiTeam.logo;
        await this.teamRepository.save(team);
      }

      return team;
    } catch (error) {
      this.logger.error(`Failed to sync team ${apiTeam.name}:`, error);
      return null;
    }
  }

  // Note: Scheduled jobs are now handled by SportsSyncService
  // These methods are kept for manual/programmatic use

  /**
   * Update live matches (called by SportsSyncService)
   * Enhanced version that targets specific matches for faster updates
   */
  async updateLiveMatches(): Promise<void> {
    if (!this.sportsApiService.isConfigured()) {
      return;
    }

    try {
      // Get matches currently marked as live in our database
      const dbLiveMatches = await this.matchRepository.find({
        where: { isLive: true },
        select: ['id', 'apiId'],
        take: 50, // Limit to avoid overwhelming API
      });

      let updatedCount = 0;
      let errorCount = 0;

      // For each match we think is live, get its current status from API
      for (const dbMatch of dbLiveMatches) {
        if (!dbMatch.apiId) continue;

        try {
          // Get specific match data from API
          const apiMatch = await this.sportsApiService.getFixtureById(parseInt(dbMatch.apiId));

          if (apiMatch) {
            await this.syncMatch(apiMatch);

            // Sync events for this match
            const events = await this.sportsApiService.getMatchEvents(parseInt(dbMatch.apiId));
            await this.syncMatchEvents(events, dbMatch.apiId);
            updatedCount++;
          }
        } catch (error) {
          errorCount++;
          this.logger.warn(
            `Failed to update match ${dbMatch.apiId}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      // Also get fresh live matches from API (fallback and discovery)
      try {
        const apiLiveMatches = await this.sportsApiService.getLiveMatches();

        for (const apiMatch of apiLiveMatches.slice(0, 20)) {
          // Limit to avoid spam
          try {
            await this.syncMatch(apiMatch);
            updatedCount++;
          } catch {
            errorCount++;
          }
        }
      } catch (error) {
        this.logger.warn('Failed to fetch fresh live matches:', error);
      }

      if (updatedCount > 0 || errorCount > 0) {
        this.logger.log(`Live match sync: ${updatedCount} updated, ${errorCount} errors`);
      }
    } catch (error) {
      this.logger.error('Failed to sync live matches:', error);
    }
  }

  /**
   * Sync today's matches (called by SportsSyncService)
   */
  async syncTodayMatches(): Promise<void> {
    this.logger.log('🔄 Starting today matches sync...');

    if (!this.sportsApiService.isConfigured()) {
      this.logger.warn('⚠️ Sports API not configured, skipping sync');
      return;
    }

    try {
      this.logger.log('📡 Fetching today matches from API...');
      const todayMatches = await this.sportsApiService.getTodayMatches();
      this.logger.log(`📊 Found ${todayMatches.length} matches from API`);

      let syncedCount = 0;
      let errorCount = 0;

      for (const apiMatch of todayMatches) {
        try {
          await this.syncMatch(apiMatch);
          syncedCount++;
        } catch (error) {
          errorCount++;
          this.logger.warn(
            `❌ Failed to sync match ${apiMatch.fixture?.id}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      this.logger.log(
        `✅ Successfully synced ${syncedCount}/${todayMatches.length} matches for today (${errorCount} errors)`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Failed to sync today matches:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Sync matches for a specific date
   */
  async syncMatchesForDate(date: string): Promise<number> {
    if (!this.sportsApiService.isConfigured()) {
      return 0;
    }

    try {
      this.logger.log(`📡 Fetching matches for ${date} from API...`);
      const matches = await this.sportsApiService.getFixtures(undefined, undefined, date);

      let syncedCount = 0;

      for (const apiMatch of matches) {
        try {
          await this.syncMatch(apiMatch);
          syncedCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to sync match ${apiMatch.fixture?.id}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      return syncedCount;
    } catch (error) {
      this.logger.error(
        `Failed to sync matches for ${date}:`,
        error instanceof Error ? error.message : String(error),
      );
      return 0;
    }
  }

  private async syncMatch(apiMatch: ApiSportsMatch): Promise<Match | null> {
    try {
      let match = await this.matchRepository.findOne({
        where: { apiId: apiMatch.fixture.id.toString() },
        relations: ['league', 'season', 'homeTeam', 'awayTeam'],
      });

      let league = await this.leagueRepository.findOne({
        where: { apiId: apiMatch.league.id.toString() },
      });

      if (!league) {
        // Fallback: create league on the fly so we don't drop live matches
        const footballSport = await this.sportRepository.findOne({
          where: { slug: 'football' },
        });
        league = this.leagueRepository.create({
          name: apiMatch.league.name,
          slug: this.generateLeagueSlug(
            apiMatch.league.name || 'unknown',
            apiMatch.league.id?.toString() || '0',
          ),
          type: this.mapLeagueType('league'),
          country: apiMatch.league.country,
          logo: apiMatch.league.logo,
          flag: apiMatch.league.flag,
          apiId: apiMatch.league.id.toString(),
          sportId: footballSport?.id,
          sortOrder: this.getLeaguePriority(apiMatch.league.name),
        });
        await this.leagueRepository.save(league);
        this.logger.debug(`Auto-created league: ${league.name}`);
      }

      let season = await this.seasonRepository.findOne({
        where: {
          leagueId: league.id,
          year: apiMatch.league.season,
        },
      });

      if (!season) {
        // Fallback: create season with reasonable defaults
        const year = apiMatch.league.season;
        const startDate = new Date(`${year}-07-01T00:00:00Z`);
        const endDate = new Date(`${year + 1}-06-30T23:59:59Z`);
        season = this.seasonRepository.create({
          name: `${year} Season`,
          year,
          startDate,
          endDate,
          isCurrent: true,
          leagueId: league.id,
        });
        await this.seasonRepository.save(season);
        this.logger.debug(`Auto-created season ${season.year} for ${league.name}`);
      }

      let homeTeam = await this.teamRepository.findOne({
        where: { apiId: apiMatch.teams.home.id.toString() },
      });

      let awayTeam = await this.teamRepository.findOne({
        where: { apiId: apiMatch.teams.away.id.toString() },
      });

      if (!homeTeam) {
        homeTeam = this.teamRepository.create({
          name: apiMatch.teams.home.name,
          slug: this.generateTeamSlug(
            apiMatch.teams.home.name || 'unknown',
            apiMatch.teams.home.id?.toString() || '0',
          ),
          code: apiMatch.teams.home.code,
          logo: apiMatch.teams.home.logo,
          country: apiMatch.league.country,
          founded: apiMatch.teams.home.founded,
          apiId: apiMatch.teams.home.id.toString(),
          leagueId: league.id,
          isActive: true,
        });
        await this.teamRepository.save(homeTeam);
        this.logger.debug(`Auto-created team: ${homeTeam.name}`);
      }

      if (!awayTeam) {
        awayTeam = this.teamRepository.create({
          name: apiMatch.teams.away.name,
          slug: this.generateTeamSlug(
            apiMatch.teams.away.name || 'unknown',
            apiMatch.teams.away.id?.toString() || '0',
          ),
          code: apiMatch.teams.away.code,
          logo: apiMatch.teams.away.logo,
          country: apiMatch.league.country,
          founded: apiMatch.teams.away.founded,
          apiId: apiMatch.teams.away.id.toString(),
          leagueId: league.id,
          isActive: true,
        });
        await this.teamRepository.save(awayTeam);
        this.logger.debug(`Auto-created team: ${awayTeam.name}`);
      }

      if (!match) {
        match = this.matchRepository.create({
          startTime: new Date(apiMatch.fixture.date),
          status: this.mapMatchStatus(apiMatch.fixture.status.short),
          venue: apiMatch.fixture.venue?.name,
          referee: apiMatch.fixture.referee,
          round: parseInt(apiMatch.league.round?.replace(/\D/g, '') || '0', 10) || undefined,
          apiId: apiMatch.fixture.id.toString(),
          leagueId: league.id,
          seasonId: season.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        });
      }

      // Update match data
      match.status = this.mapMatchStatus(apiMatch.fixture.status.short);

      if (apiMatch.goals) {
        match.homeScore = apiMatch.goals.home || 0;
        match.awayScore = apiMatch.goals.away || 0;
      }

      if (apiMatch.score) {
        if (apiMatch.score.halftime) {
          match.homeHalfTimeScore = apiMatch.score.halftime.home || 0;
          match.awayHalfTimeScore = apiMatch.score.halftime.away || 0;
        }

        if (apiMatch.score.fulltime) {
          match.homeScore = apiMatch.score.fulltime.home || 0;
          match.awayScore = apiMatch.score.fulltime.away || 0;
        }

        if (apiMatch.score.extratime) {
          match.homeExtraTimeScore = apiMatch.score.extratime.home || 0;
          match.awayExtraTimeScore = apiMatch.score.extratime.away || 0;
        }

        if (apiMatch.score.penalty) {
          match.homePenaltyScore = apiMatch.score.penalty.home || 0;
          match.awayPenaltyScore = apiMatch.score.penalty.away || 0;
        }
      }

      await this.matchRepository.save(match);
      return match;
    } catch (error) {
      this.logger.error(`Failed to sync match ${apiMatch.fixture.id}:`, error);
      return null;
    }
  }

  private async syncMatchEvents(apiEvents: ApiSportsEvent[], matchApiId: string): Promise<void> {
    try {
      const match = await this.matchRepository.findOne({
        where: { apiId: matchApiId },
      });

      if (!match) {
        this.logger.warn(`Match ${matchApiId} not found for events sync`);
        return;
      }

      for (const apiEvent of apiEvents) {
        const team = await this.teamRepository.findOne({
          where: { apiId: apiEvent.team.id.toString() },
        });

        if (!team) {
          this.logger.warn(`Team ${apiEvent.team.name} not found for event`);
          continue;
        }

        // Check if event already exists
        const existingEvent = await this.matchEventRepository.findOne({
          where: {
            matchId: match.id,
            teamId: team.id,
            minute: apiEvent.time.elapsed,
            type: this.mapEventType(apiEvent.type),
            player: apiEvent.player?.name,
          },
        });

        if (!existingEvent) {
          const matchEvent = this.matchEventRepository.create({
            type: this.mapEventType(apiEvent.type),
            minute: apiEvent.time.elapsed,
            extraTime: apiEvent.time.extra,
            player: apiEvent.player?.name,
            assistPlayer: apiEvent.assist?.name,
            detail: apiEvent.detail,
            description: apiEvent.comments,
            matchId: match.id,
            teamId: team.id,
          });

          await this.matchEventRepository.save(matchEvent);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to sync match events for ${matchApiId}:`, error);
    }
  }

  // Utility methods - Major league filtering removed to provide comprehensive coverage
  // Users now have access to all available football data for predictions

  private mapLeagueType(apiType?: string): LeagueType {
    switch (apiType?.toLowerCase?.() || '') {
      case 'cup':
        return LeagueType.CUP;
      case 'league':
        return LeagueType.LEAGUE;
      default:
        return LeagueType.LEAGUE;
    }
  }

  private getLeaguePriority(leagueName?: string): number {
    const priorities: Record<string, number> = {
      'Premier League': 100,
      'Champions League': 95,
      'La Liga': 90,
      'Serie A': 85,
      Bundesliga: 80,
      'Ligue 1': 75,
      'Europa League': 70,
    };

    if (!leagueName) return 50;
    for (const [name, priority] of Object.entries(priorities)) {
      if (leagueName.includes(name)) {
        return priority;
      }
    }

    return 50; // Default priority
  }

  private mapMatchStatus(apiStatus: string): MatchStatus {
    switch (apiStatus) {
      case 'NS':
        return MatchStatus.SCHEDULED;
      case '1H':
      case '2H':
        return MatchStatus.LIVE;
      case 'HT':
        return MatchStatus.HALFTIME;
      case 'FT':
        return MatchStatus.FINISHED;
      case 'PST':
        return MatchStatus.POSTPONED;
      case 'CANC':
        return MatchStatus.CANCELLED;
      case 'SUSP':
        return MatchStatus.SUSPENDED;
      case 'ABD':
        return MatchStatus.ABANDONED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }

  private mapEventType(apiType: string): MatchEventType {
    switch (apiType.toLowerCase()) {
      case 'goal':
        return MatchEventType.GOAL;
      case 'card':
        return MatchEventType.YELLOW_CARD;
      case 'redcard':
        return MatchEventType.RED_CARD;
      case 'subst':
        return MatchEventType.SUBSTITUTION;
      case 'var':
        return MatchEventType.VAR;
      default:
        return MatchEventType.GOAL; // Default fallback
    }
  }
}
