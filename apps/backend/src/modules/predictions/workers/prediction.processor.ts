/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictionBatchService } from '../services/prediction-batch.service';
import { PredictionsService } from '../services/predictions.service';
import { Match } from '@/modules/sports/entities/match.entity';
import { User } from '@/modules/users/entities/user.entity';
import { BatchStatus } from '../entities/prediction-batch.entity';
import { LoggerService } from '@/common/services/logger.service';

interface BulkPredictionJobData {
  batchId: string;
  userId: string;
  filters: {
    dateFrom: Date;
    dateTo: Date;
    leagueIds?: string[];
    excludeStarted?: boolean;
  };
  predictionTypes: string[];
  scenario?: string;
}

@Injectable()
@Processor('predictions-bulk')
export class PredictionProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly batchService: PredictionBatchService,
    private readonly predictionsService: PredictionsService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<BulkPredictionJobData>): Promise<void> {
    const { batchId, userId, filters, predictionTypes, scenario } = job.data;

    this.logger.info('Processing bulk prediction job', {
      service: 'prediction-processor',
      jobId: job.id,
      batchId,
      userId,
    });

    try {
      // Update batch status to processing
      await this.batchService.updateBatchStatus(batchId, BatchStatus.PROCESSING, {
        startedAt: new Date(),
      });

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Find matches based on filters
      const matches = await this.findMatchesForBatch(filters);

      if (matches.length === 0) {
        await this.batchService.updateBatchStatus(batchId, BatchStatus.COMPLETED, {
          message: 'No matches found for the given filters',
          totalMatches: 0,
        });
        return;
      }

      // Update batch with total matches
      await this.batchService.updateBatchStatus(batchId, BatchStatus.PROCESSING, {
        totalMatches: matches.length,
      });

      let processed = 0;
      let successful = 0;
      let failed = 0;

      // Process each match
      for (const match of matches) {
        try {
          await this.predictionsService.generatePrediction(user, {
            matchId: match.id,
            predictionTypes: predictionTypes as any[],
            scenario,
            includeReasoning: true,
          });

          successful++;
          job.updateProgress((processed / matches.length) * 100);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(`Failed to generate prediction for match ${match.id}`, error.stack, {
            service: 'prediction-processor',
            batchId,
            matchId: match.id,
          });
          failed++;
        }

        processed++;
      }

      // Update batch status to completed
      await this.batchService.updateBatchStatus(batchId, BatchStatus.COMPLETED, {
        processedMatches: processed,
        successfulPredictions: successful,
        failedPredictions: failed,
        completedAt: new Date(),
      });

      this.logger.info('Bulk prediction job completed', {
        service: 'prediction-processor',
        batchId,
        processed,
        successful,
        failed,
      });
    } catch (error) {
      this.logger.error('Bulk prediction job failed', error.stack, {
        service: 'prediction-processor',
        batchId,
        jobId: job.id,
      });

      await this.batchService.updateBatchStatus(batchId, BatchStatus.FAILED, {
        error: error.message,
        failedAt: new Date(),
      });

      throw error;
    }
  }

  private async findMatchesForBatch(filters: BulkPredictionJobData['filters']): Promise<Match[]> {
    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league')
      .where('match.date >= :dateFrom', { dateFrom: filters.dateFrom })
      .andWhere('match.date <= :dateTo', { dateTo: filters.dateTo });

    if (filters.leagueIds && filters.leagueIds.length > 0) {
      queryBuilder.andWhere('match.leagueId IN (:...leagueIds)', {
        leagueIds: filters.leagueIds,
      });
    }

    if (filters.excludeStarted) {
      queryBuilder.andWhere('match.status IN (:...statuses)', {
        statuses: ['SCHEDULED', 'POSTPONED'],
      });
    }

    return queryBuilder
      .orderBy('match.date', 'ASC')
      .limit(1000) // Safety limit
      .getMany();
  }
}
