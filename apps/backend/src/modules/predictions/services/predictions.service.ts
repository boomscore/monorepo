/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction, PredictionType, PredictionStatus } from '../entities/prediction.entity';
import { Match } from '@/modules/sports/entities/match.entity';
import { User } from '@/modules/users/entities/user.entity';
import { LoggerService } from '@/common/services/logger.service';
import { OpenAIProviderService } from './openai-provider.service';
import { PromptService } from './prompt.service';

export interface GeneratePredictionInput {
  matchId: string;
  predictionTypes: PredictionType[];
  scenario?: string;
  includeReasoning?: boolean;
}

export interface PredictionFilters {
  matchId?: string;
  userId?: string;
  status?: PredictionStatus;
  type?: PredictionType;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly logger: LoggerService,
    private readonly openaiProvider: OpenAIProviderService,
    private readonly promptService: PromptService,
  ) {}

  async generatePrediction(user: User, input: GeneratePredictionInput): Promise<Prediction[]> {
    this.logger.info('Generating predictions', {
      service: 'predictions',
      userId: user.id,
      matchId: input.matchId,
      types: input.predictionTypes,
    });

    const match = await this.matchRepository.findOne({
      where: { id: input.matchId },
      relations: ['homeTeam', 'awayTeam', 'league'],
    });

    if (!match) {
      throw new Error('Match not found');
    }

    const predictions: Prediction[] = [];

    for (const type of input.predictionTypes) {
      try {
        const prediction = await this.generateSinglePrediction(
          user,
          match,
          type,
          input.scenario,
          input.includeReasoning,
        );
        predictions.push(prediction);
      } catch (error) {
        this.logger.error(`Failed to generate ${type} prediction`, error.stack, {
          service: 'predictions',
          matchId: input.matchId,
          type,
        });
      }
    }

    return predictions;
  }

  async findPredictions(filters: PredictionFilters): Promise<Prediction[]> {
    const queryBuilder = this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.match', 'match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .leftJoinAndSelect('match.league', 'league');

    if (filters.matchId) {
      queryBuilder.andWhere('prediction.matchId = :matchId', {
        matchId: filters.matchId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere('prediction.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('prediction.status = :status', {
        status: filters.status,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('prediction.type = :type', {
        type: filters.type,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('match.date >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('match.date <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return queryBuilder.orderBy('prediction.createdAt', 'DESC').limit(100).getMany();
  }

  async findById(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: ['match', 'match.homeTeam', 'match.awayTeam', 'match.league'],
    });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    return prediction;
  }

  async updatePredictionResult(
    predictionId: string,
    actual: any,
    isCorrect: boolean,
  ): Promise<Prediction> {
    const prediction = await this.findById(predictionId);

    prediction.actualOutcome = actual;
    prediction.isCorrect = isCorrect;
    prediction.status = PredictionStatus.FINISHED;
    prediction.updatedAt = new Date();

    return this.predictionRepository.save(prediction);
  }

  async getPredictionAnalytics(filters: PredictionFilters) {
    const queryBuilder = this.predictionRepository
      .createQueryBuilder('prediction')
      .select([
        'COUNT(*) as total',
        'AVG(prediction.confidence) as avgConfidence',
        'SUM(CASE WHEN prediction.isCorrect = true THEN 1 ELSE 0 END) as correct',
        'prediction.type as type',
      ])
      .where('prediction.status = :status', { status: PredictionStatus.FINISHED });

    if (filters.userId) {
      queryBuilder.andWhere('prediction.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('prediction.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('prediction.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    const results = await queryBuilder.groupBy('prediction.type').getRawMany();

    // Calculate overall statistics
    const totalPredictions = results.reduce((sum, result) => sum + parseInt(result.total), 0);
    const correctPredictions = results.reduce((sum, result) => sum + parseInt(result.correct), 0);
    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
    const averageConfidence =
      results.length > 0
        ? results.reduce((sum, result) => sum + parseFloat(result.avgConfidence || '0'), 0) /
          results.length
        : 0;

    const byType = results.map(result => ({
      type: result.type,
      total: parseInt(result.total),
      correct: parseInt(result.correct),
      accuracy: result.total > 0 ? (result.correct / result.total) * 100 : 0,
    }));

    return {
      totalPredictions,
      correctPredictions,
      accuracy,
      averageConfidence,
      byType,
    };
  }

  private async generateSinglePrediction(
    user: User,
    match: Match,
    type: PredictionType,
    scenario?: string,
    includeReasoning = false,
  ): Promise<Prediction> {
    // Generate prompt for this prediction type
    const promptResult = this.promptService.generatePredictionPrompt({
      match,
      homeTeam: match.homeTeam, // Add required homeTeam
      awayTeam: match.awayTeam, // Add required awayTeam
      predictionTypes: [type],
      scenario,
      includeReasoning,
    });

    // Get AI prediction
    const response = await this.openaiProvider.generatePrediction({
      prompt:
        typeof promptResult === 'string'
          ? promptResult
          : (promptResult as any).content || promptResult.toString(),
      temperature: 0.7,
      maxTokens: 1000,
      responseFormat: 'json_object',
    });

    // Parse response
    const predictionData = JSON.parse(response.content);

    // Create and save prediction
    const prediction = this.predictionRepository.create({
      userId: user.id,
      matchId: match.id,
      type,
      outcome: predictionData.outcome as any, // Cast to enum
      confidence: predictionData.confidence || 0.5,
      reasoning: includeReasoning ? predictionData.reasoning : null,
      metadata: {
        scenario,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        cost: response.cost,
      },
      status: PredictionStatus.PENDING,
    });

    return await this.predictionRepository.save(prediction);
  }
}
