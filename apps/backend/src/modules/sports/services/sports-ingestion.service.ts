/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { Match, MatchStatus } from '../entities/match.entity';
import { League } from '../entities/league.entity';
import { Team } from '../entities/team.entity';
import { SportsApiService } from './sports-api.service';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class SportsIngestionService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectQueue('ingestion')
    private readonly ingestionQueue: Queue,
    private readonly sportsApiService: SportsApiService,
    private readonly logger: LoggerService,
  ) {}

  @Cron('0 */30 * * * *') // Every 30 minutes
  async scheduledIngestion(): Promise<void> {
    const enabled = process.env.SPORTS_SYNC_ENABLED !== 'false';

    if (!enabled) {
      return;
    }

    this.logger.info('Starting scheduled sports data ingestion', {
      service: 'sports-ingestion',
    });

    try {
      // Queue today's matches sync
      await this.ingestionQueue.add('sync-today-matches', {
        date: new Date().toISOString().split('T')[0],
      });

      // Queue live matches sync
      await this.ingestionQueue.add('sync-live-matches', {});

      // Queue upcoming matches (next 7 days)
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        await this.ingestionQueue.add('sync-upcoming-matches', {
          date: date.toISOString().split('T')[0],
        });
      }
    } catch (error) {
      this.logger.error('Scheduled ingestion failed', error.stack, {
        service: 'sports-ingestion',
      });
    }
  }

  async syncTodayMatches(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.syncMatchesByDate(today);
  }

  async syncLiveMatches(): Promise<void> {
    this.logger.info('Syncing live matches', {
      service: 'sports-ingestion',
    });

    try {
      const liveMatches = await this.sportsApiService.getLiveMatches();

      let updated = 0;

      for (const apiMatch of liveMatches) {
        try {
          await this.syncSingleMatch(apiMatch);
          updated++;
        } catch (error) {
          this.logger.error(`Failed to sync live match ${apiMatch.fixture.id}`, error.stack, {
            service: 'sports-ingestion',
            matchId: apiMatch.fixture.id,
          });
        }
      }

      this.logger.info('Live matches sync completed', {
        service: 'sports-ingestion',
        updated,
        total: liveMatches.length,
      });
    } catch (error) {
      this.logger.error('Failed to sync live matches', error.stack, {
        service: 'sports-ingestion',
      });
      throw error;
    }
  }

  async syncMatchesByDate(date: string): Promise<void> {
    this.logger.info('Syncing matches by date', {
      service: 'sports-ingestion',
      date,
    });

    try {
      const apiMatches = await this.sportsApiService.getFixturesByDate(date);

      let created = 0;
      let updated = 0;

      for (const apiMatch of apiMatches) {
        try {
          const result = await this.syncSingleMatch(apiMatch);
          if (result.created) {
            created++;
          } else {
            updated++;
          }
        } catch (error) {
          this.logger.error(`Failed to sync match ${apiMatch.fixture.id}`, error.stack, {
            service: 'sports-ingestion',
            matchId: apiMatch.fixture.id,
            date,
          });
        }
      }

      this.logger.info('Matches sync completed', {
        service: 'sports-ingestion',
        date,
        created,
        updated,
        total: apiMatches.length,
      });
    } catch (error) {
      this.logger.error('Failed to sync matches by date', error.stack, {
        service: 'sports-ingestion',
        date,
      });
      throw error;
    }
  }

  async syncTeamsByLeague(leagueApiId: number, season: number): Promise<void> {
    this.logger.info('Syncing teams by league', {
      service: 'sports-ingestion',
      leagueApiId,
      season,
    });

    try {
      const league = await this.leagueRepository.findOne({
        where: { apiId: leagueApiId },
      });

      if (!league) {
        throw new Error(`League with API ID ${leagueApiId} not found`);
      }

      const apiTeams = await this.sportsApiService.getTeamsByLeague(leagueApiId, season);

      let created = 0;
      let updated = 0;

      for (const apiTeam of apiTeams) {
        let team = await this.teamRepository.findOne({
          where: { apiId: apiTeam.team.id },
        });

        if (team) {
          // Update existing team
          team.name = apiTeam.team.name;
          team.logo = apiTeam.team.logo;
          team.country = apiTeam.team.country;
          team.founded = apiTeam.team.founded;
          team.isActive = true;
          team.updatedAt = new Date();

          await this.teamRepository.save(team);
          updated++;
        } else {
          // Create new team
          team = this.teamRepository.create({
            apiId: apiTeam.team.id,
            name: apiTeam.team.name,
            slug: this.generateSlug(apiTeam.team.name),
            logo: apiTeam.team.logo,
            country: apiTeam.team.country,
            founded: apiTeam.team.founded,
            isActive: true,
          });

          await this.teamRepository.save(team);
          created++;
        }
      }

      this.logger.info('Teams sync completed', {
        service: 'sports-ingestion',
        leagueApiId,
        season,
        created,
        updated,
        total: apiTeams.length,
      });
    } catch (error) {
      this.logger.error('Failed to sync teams', error.stack, {
        service: 'sports-ingestion',
        leagueApiId,
        season,
      });
      throw error;
    }
  }

  private async syncSingleMatch(apiMatch: any): Promise<{ created: boolean }> {
    let match = await this.matchRepository.findOne({
      where: { apiId: apiMatch.fixture.id },
    });

    const created = !match;

    if (!match) {
      // Create new match
      match = this.matchRepository.create({
        apiId: apiMatch.fixture.id,
        startTime: new Date(apiMatch.fixture.date), // Changed from 'date' to 'startTime'
        status: this.mapApiStatus(apiMatch.fixture.status.short),
        round: apiMatch.league.round,
        minute: apiMatch.fixture.status.elapsed,
      });
    } else {
      // Update existing match
      match.status = this.mapApiStatus(apiMatch.fixture.status.short);
      match.minute = apiMatch.fixture.status.elapsed;
      match.updatedAt = new Date();
    }

    // Set scores if available
    if (apiMatch.goals) {
      match.homeScore = apiMatch.goals.home;
      match.awayScore = apiMatch.goals.away;
    }

    // Set league, home team, and away team
    const league = await this.leagueRepository.findOne({
      where: { apiId: apiMatch.league.id },
    });

    if (league) {
      match.leagueId = league.id;
    }

    // Get or create teams
    const homeTeam = await this.getOrCreateTeam(apiMatch.teams.home);
    const awayTeam = await this.getOrCreateTeam(apiMatch.teams.away);

    match.homeTeamId = homeTeam.id;
    match.awayTeamId = awayTeam.id;

    await this.matchRepository.save(match);

    return { created };
  }

  private async getOrCreateTeam(apiTeam: any): Promise<Team> {
    let team = await this.teamRepository.findOne({
      where: { apiId: apiTeam.id },
    });

    if (!team) {
      team = this.teamRepository.create({
        apiId: apiTeam.id,
        name: apiTeam.name,
        slug: this.generateSlug(apiTeam.name),
        logo: apiTeam.logo,
        isActive: true,
      });

      await this.teamRepository.save(team);
    }

    return team;
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
