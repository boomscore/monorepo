/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { SportsIngestionService } from '../services/sports-ingestion.service';
import { LoggerService } from '@/common/services/logger.service';

interface IngestionJobData {
  date?: string;
  leagueApiId?: number;
  season?: number;
}

@Injectable()
@Processor('ingestion')
export class SportsIngestionProcessor extends WorkerHost {
  constructor(
    private readonly ingestionService: SportsIngestionService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<IngestionJobData>): Promise<void> {
    this.logger.info('Processing sports ingestion job', {
      service: 'sports-ingestion-processor',
      jobName: job.name,
      jobId: job.id,
      data: job.data,
    });

    try {
      switch (job.name) {
        case 'sync-today-matches':
          await this.ingestionService.syncTodayMatches();
          break;

        case 'sync-live-matches':
          await this.ingestionService.syncLiveMatches();
          break;

        case 'sync-upcoming-matches':
          if (job.data.date) {
            await this.ingestionService.syncMatchesByDate(job.data.date);
          }
          break;

        case 'sync-teams-by-league':
          if (job.data.leagueApiId && job.data.season) {
            await this.ingestionService.syncTeamsByLeague(job.data.leagueApiId, job.data.season);
          }
          break;

        default:
          this.logger.warn('Unknown ingestion job type', {
            service: 'sports-ingestion-processor',
            jobName: job.name,
          });
          break;
      }

      this.logger.info('Sports ingestion job completed successfully', {
        service: 'sports-ingestion-processor',
        jobName: job.name,
        jobId: job.id,
      });
    } catch (error) {
      this.logger.error('Sports ingestion job failed', error.stack, {
        service: 'sports-ingestion-processor',
        jobName: job.name,
        jobId: job.id,
        data: job.data,
      });

      throw error;
    }
  }
}
