import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sport } from '../entities/sport.entity';
import { League } from '../entities/league.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { SportsIngestionService } from './sports-ingestion.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SportsSyncService {
  private readonly logger = new Logger(SportsSyncService.name);
  private isInitialized = false;

  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly sportsIngestionService: SportsIngestionService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize sports data only if needed
   */
  async initializeIfNeeded(): Promise<void> {
    // TEMPORARILY FORCE INITIALIZATION - Remove this after first successful run
    this.isInitialized = false;

    this.logger.log(`🔍 DEBUG: isInitialized = ${this.isInitialized}`);

    if (this.isInitialized) {
      this.logger.log('🏈 Sports data already initialized, skipping');
      return;
    }

    this.logger.log('🏈 Starting sports data initialization...');

    try {
      // Check if we have basic sports data
      const sportsCount = await this.sportRepository.count();
      const leaguesCount = await this.leagueRepository.count();

      this.logger.log(`📊 Current data: ${sportsCount} sports, ${leaguesCount} leagues`);

      // FORCE full initialization if no leagues exist (comprehensive data access)
      if (leaguesCount === 0) {
        this.logger.log(
          '🔄 No leagues found - performing FULL initialization for comprehensive football data...',
        );
        await this.performFullInitialization();
      } else {
        this.logger.log("✅ Basic data exists, checking freshness and syncing today's matches...");
        await this.checkAndUpdateStaleData();
      }

      this.isInitialized = true;
      this.logger.log('🎉 Sports data initialization complete');
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize sports data:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * Perform full initialization (only for empty database)
   */
  private async performFullInitialization(): Promise<void> {
    this.logger.log('🚀 Performing full sports data initialization...');

    try {
      // Initialize sports
      this.logger.log('🏈 Step 1: Initializing sports...');
      await this.sportsIngestionService.initializeSports();

      // Sync all leagues from API (comprehensive coverage)
      this.logger.log('🌍 Step 2: Syncing leagues from API...');
      await this.sportsIngestionService.syncLeagues();

      // Sync current season data (teams and today matches)
      this.logger.log('📅 Step 3: Syncing current season data...');
      await this.syncCurrentSeasonData();

      this.logger.log('✅ Full initialization complete');
    } catch (error) {
      this.logger.error('❌ Full initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check for stale data and update if needed
   */
  private async checkAndUpdateStaleData(): Promise<void> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check if we have recent matches
    const recentMatchesCount = await this.matchRepository
      .createQueryBuilder('match')
      .where('match.startTime >= :oneDayAgo', { oneDayAgo })
      .getCount();

    this.logger.log(`📊 Found ${recentMatchesCount} recent matches in last 24 hours`);

    // Always sync today's matches to ensure freshness
    this.logger.log("🔄 Syncing today's matches to ensure fresh data...");
    await this.sportsIngestionService.syncTodayMatches();

    if (recentMatchesCount === 0) {
      this.logger.log('🔄 No recent matches found, syncing current season data...');
      await this.syncCurrentSeasonData();
    } else {
      this.logger.log('✅ Recent matches found, data freshness check complete');
    }
  }

  /**
   * Sync current season data for active leagues
   */
  private async syncCurrentSeasonData(): Promise<void> {
    try {
      // Get active leagues (you can customize this query)
      const activeLeagues = await this.leagueRepository
        .createQueryBuilder('league')
        .where('league.isActive = :isActive', { isActive: true })
        .limit(10) // Limit to avoid overwhelming the API
        .getMany();

      this.logger.log(`Syncing data for ${activeLeagues.length} active leagues...`);

      for (const league of activeLeagues) {
        try {
          // Sync teams for this league
          if (league.apiId) {
            await this.sportsIngestionService.syncTeams(league.apiId, new Date().getFullYear());
          }

          // Sync recent matches
          await this.sportsIngestionService.syncTodayMatches();

          this.logger.log(`Synced data for league: ${league.name}`);
        } catch (error) {
          this.logger.warn(`Failed to sync league ${league.name}:`, error);
          // Continue with other leagues
        }
      }
    } catch (error) {
      this.logger.error('Failed to sync current season data:', error);
    }
  }

  /**
   * Daily sync job - runs at 6 AM every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailySync(): Promise<void> {
    if (!this.configService.get<boolean>('SPORTS_SYNC_ENABLED', true)) {
      return;
    }

    this.logger.log('Starting daily sports data sync...');

    try {
      await this.syncCurrentSeasonData();
      this.logger.log('Daily sync completed successfully');
    } catch (error) {
      this.logger.error('Daily sync failed:', error);
    }
  }

  /**
   * Unified live matches sync - runs every 3 minutes during match hours
   * Optimized single sync process for real-time updates
   */
  @Cron('*/3 * * * *') // Every 3 minutes - balanced for API usage and real-time feel
  async unifiedLiveSync(): Promise<void> {
    if (!this.configService.get<boolean>('SPORTS_SYNC_ENABLED', true)) {
      return;
    }

    // Extended hours to cover global matches (6 AM to 2 AM UTC next day)
    const hour = new Date().getUTCHours();
    if (hour >= 2 && hour < 6) {
      return; // Only skip 2-6 AM UTC (quietest period)
    }

    try {
      // Check if we have any matches that need updating (live or recently concluded)
      const relevantMatches = await this.matchRepository
        .createQueryBuilder('match')
        .where('(match.isLive = :isLive OR match.status IN (:...recentStatuses))', {
          isLive: true,
          recentStatuses: ['live', 'halftime', 'finished'], // Include finished to catch status changes
        })
        .andWhere('match.startTime >= :twoDaysAgo AND match.startTime <= :tomorrow', {
          twoDaysAgo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .getCount();

      if (relevantMatches > 0) {
        this.logger.debug(
          `🔴 Running unified live sync for ${relevantMatches} active/recent matches`,
        );
        await this.sportsIngestionService.updateLiveMatches();
      } else {
        this.logger.debug('✅ No active matches found, skipping live sync');
      }
    } catch (error) {
      this.logger.warn('Unified live sync failed:', error);
    }
  }

  /**
   * Today's matches sync - runs every 15 minutes
   * Ensures today's fixtures are always fresh
   */
  @Cron('*/15 * * * *') // Every 15 minutes
  async todayMatchesSync(): Promise<void> {
    if (!this.configService.get<boolean>('SPORTS_SYNC_ENABLED', true)) {
      return;
    }

    try {
      this.logger.debug("📅 Syncing today's matches for fresh data");
      await this.sportsIngestionService.syncTodayMatches();
    } catch (error) {
      this.logger.warn('Today matches sync failed:', error);
    }
  }

  /**
   * Cleanup stale live matches - runs every hour
   * Removes live flags from old matches that are no longer live
   */
  @Cron('0 * * * *') // Every hour
  async cleanupStaleLiveMatches(): Promise<void> {
    if (!this.configService.get<boolean>('SPORTS_SYNC_ENABLED', true)) {
      return;
    }

    try {
      // Find matches that are marked as live but are older than 3 hours
      const staleThreshold = new Date(Date.now() - 3 * 60 * 60 * 1000);

      const result = await this.matchRepository
        .createQueryBuilder()
        .update('matches')
        .set({ isLive: false })
        .where('isLive = :isLive', { isLive: true })
        .andWhere('date < :staleThreshold', { staleThreshold })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Cleaned up ${result.affected} stale live matches`);
      }
    } catch (error) {
      this.logger.warn('Failed to cleanup stale live matches:', error);
    }
  }

  /**
   * Sync matches for a specific date (for time-travel functionality)
   * Called when users navigate to dates without match data
   */
  async syncMatchesForDate(date: string): Promise<{ message: string; matchCount: number }> {
    this.logger.log(`🕰️ Syncing matches for date: ${date}`);

    try {
      // Check if we already have matches for this date
      const existingCount = await this.matchRepository
        .createQueryBuilder('match')
        .where('DATE(match.startTime) = :date', { date })
        .getCount();

      if (existingCount > 0) {
        this.logger.log(`✅ Found ${existingCount} existing matches for ${date}`);
        return {
          message: `Found ${existingCount} matches for ${date}`,
          matchCount: existingCount,
        };
      }

      // Sync matches for the specific date
      const matchCount = await this.sportsIngestionService.syncMatchesForDate(date);

      const message = `Successfully synced ${matchCount} matches for ${date}`;
      this.logger.log(`✅ ${message}`);

      return { message, matchCount };
    } catch (error) {
      this.logger.error(`❌ Failed to sync matches for date ${date}:`, error);
      throw error;
    }
  }

  /**
   * Manual sync trigger (for admin use)
   */
  async triggerFullSync(): Promise<{ message: string; stats: any }> {
    this.logger.log('Manual full sync triggered...');

    const startTime = Date.now();
    const stats = {
      leagues: 0,
      teams: 0,
      matches: 0,
      errors: 0,
    };

    try {
      // Get all active leagues
      const leagues = await this.leagueRepository.find({
        where: { isActive: true },
      });

      for (const league of leagues) {
        try {
          if (league.apiId) {
            await this.sportsIngestionService.syncTeams(league.apiId, new Date().getFullYear());
          }
          await this.sportsIngestionService.syncTodayMatches();
          stats.leagues++;
        } catch (error) {
          stats.errors++;
          this.logger.warn(`Failed to sync league ${league.name}:`, error);
        }
      }

      // Update counts
      stats.teams = await this.teamRepository.count();
      stats.matches = await this.matchRepository.count();

      const duration = Date.now() - startTime;
      const message = `Full sync completed in ${duration}ms. Synced ${stats.leagues} leagues, ${stats.teams} teams, ${stats.matches} matches with ${stats.errors} errors.`;

      this.logger.log(message);
      return { message, stats };
    } catch (error) {
      this.logger.error('Manual sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    initialized: boolean;
    lastSync: Date | null;
    nextScheduledSync: string;
    syncProcesses: string[];
  } {
    return {
      initialized: this.isInitialized,
      lastSync: null, // You can track this if needed
      nextScheduledSync: 'Optimized sync schedule active',
      syncProcesses: [
        'Daily Sync: Every day at 6 AM UTC (league/team data)',
        'Live Sync: Every 3 minutes during match hours (6 AM - 2 AM UTC)',
        'Today Sync: Every 15 minutes (fresh fixture data)',
        'Cleanup: Every hour (remove stale live flags)',
        'Time-travel: On-demand sync for historical dates',
      ],
    };
  }
}
