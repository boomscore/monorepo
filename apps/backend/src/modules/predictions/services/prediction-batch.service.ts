/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PredictionBatch, BatchStatus } from '../entities/prediction-batch.entity';
import { Prediction, PredictionType, PredictionStatus } from '../entities/prediction.entity';
import { User } from '@/modules/users/entities/user.entity';
import { LoggerService } from '@/common/services/logger.service';

export interface BulkPredictionFilters {
  dateFrom: Date;
  dateTo: Date;
  leagueIds?: string[];
  excludeStarted?: boolean;
}

export interface GenerateBulkPredictionsInput {
  filters: BulkPredictionFilters;
  predictionTypes: PredictionType[];
  scenario?: string;
}

@Injectable()
export class PredictionBatchService {
  constructor(
    @InjectRepository(PredictionBatch)
    private readonly batchRepository: Repository<PredictionBatch>,
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectQueue('predictions-bulk')
    private readonly predictionsQueue: Queue,
    private readonly logger: LoggerService,
  ) {}

  async generateBulkPredictions(
    user: User,
    input: GenerateBulkPredictionsInput,
  ): Promise<PredictionBatch> {
    this.logger.info('Starting bulk prediction generation', {
      service: 'prediction-batch',
      userId: user.id,
      filters: input.filters,
      types: input.predictionTypes,
    });

    // Create batch record
    const batch = this.batchRepository.create({
      userId: user.id,
      filters: {
        dateFrom: input.filters.dateFrom.toISOString().split('T')[0], // Convert Date to string
        dateTo: input.filters.dateTo.toISOString().split('T')[0], // Convert Date to string
        leagueIds: input.filters.leagueIds,
        excludeStarted: input.filters.excludeStarted,
      },
      predictionTypes: input.predictionTypes,
      scenario: input.scenario,
      status: BatchStatus.PENDING,
      totalMatches: 0, // Will be updated by worker
    });

    const savedBatch = await this.batchRepository.save(batch);

    // Queue the bulk prediction job
    await this.predictionsQueue.add(
      'bulk-predictions',
      {
        batchId: savedBatch.id,
        userId: user.id,
        filters: input.filters,
        predictionTypes: input.predictionTypes,
        scenario: input.scenario,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return savedBatch;
  }

  async findById(id: string): Promise<PredictionBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['predictions'],
    });

    if (!batch) {
      throw new Error('Prediction batch not found');
    }

    return batch;
  }

  async findUserBatches(userId: string): Promise<PredictionBatch[]> {
    return this.batchRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async updateBatchStatus(
    batchId: string,
    status: BatchStatus,
    metadata?: any,
  ): Promise<PredictionBatch> {
    const batch = await this.findById(batchId);

    batch.status = status;
    batch.updatedAt = new Date();

    if (metadata) {
      batch.metadata = { ...batch.metadata, ...metadata };
    }

    if (status === BatchStatus.COMPLETED) {
      batch.completedAt = new Date();

      // Update completion statistics
      const predictions = await this.predictionRepository.find({
        where: { batchId },
      });

      batch.totalPredictions = predictions.length;
      batch.successfulPredictions = predictions.filter(p => p.status === 'PENDING').length;
      batch.failedPredictions = predictions.filter(
        p => p.status === PredictionStatus.INCORRECT,
      ).length;
    }

    return this.batchRepository.save(batch);
  }

  async getBatchStatistics(batchId: string) {
    const batch = await this.findById(batchId);

    const predictions = await this.predictionRepository.find({
      where: { batchId },
      relations: ['match'],
    });

    let totalConfidence = 0;
    let totalCost = 0;
    let completedPredictions = 0;
    let failedPredictions = 0;

    for (const prediction of predictions) {
      // Sum confidence
      totalConfidence += prediction.confidence;

      // Count completed/failed
      if (prediction.status === PredictionStatus.FINISHED) {
        completedPredictions++;
      } else if (prediction.status === PredictionStatus.INCORRECT) {
        failedPredictions++;
      }

      // Sum cost from metadata
      if (prediction.metadata?.cost) {
        totalCost += prediction.metadata.cost;
      }
    }

    return {
      totalMatches: batch.totalMatches || predictions.length,
      completedPredictions,
      failedPredictions,
      averageConfidence: predictions.length > 0 ? totalConfidence / predictions.length : 0,
      estimatedCost: totalCost,
      processingTime: 0, // TODO: Calculate actual processing time
    };
  }

  async cancelBatch(batchId: string, userId: string): Promise<PredictionBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found or access denied');
    }

    if (batch.status !== BatchStatus.PENDING && batch.status !== BatchStatus.PROCESSING) {
      throw new Error('Cannot cancel batch in current status');
    }

    // Cancel the job in the queue
    const jobs = await this.predictionsQueue.getJobs(['waiting', 'active']);
    const batchJob = jobs.find(job => job.data.batchId === batchId);

    if (batchJob) {
      await batchJob.remove();
    }

    return this.updateBatchStatus(batchId, BatchStatus.CANCELLED);
  }

  async retryBatch(batchId: string, userId: string): Promise<PredictionBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId, userId },
    });

    if (!batch) {
      throw new Error('Batch not found or access denied');
    }

    if (batch.status !== BatchStatus.FAILED) {
      throw new Error('Can only retry failed batches');
    }

    // Update status and re-queue
    await this.updateBatchStatus(batchId, BatchStatus.PENDING);

    await this.predictionsQueue.add(
      'bulk-predictions',
      {
        batchId: batch.id,
        userId: batch.userId,
        filters: batch.filters,
        predictionTypes: batch.predictionTypes,
        scenario: batch.scenario,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return batch;
  }
}
