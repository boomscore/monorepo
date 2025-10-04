/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PredictionBatchService } from '../services/prediction-batch.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PredictionBatch } from '../entities/prediction-batch.entity';
import { GenerateBulkPredictionsInput, BatchStatistics } from '../dto/prediction.dto';

@Resolver(() => PredictionBatch)
@UseGuards(JwtAuthGuard)
export class PredictionBatchResolver {
  constructor(private readonly batchService: PredictionBatchService) {}

  @Mutation(() => PredictionBatch)
  async generateBulkPredictions(
    @Args('input') input: GenerateBulkPredictionsInput,
    @Context() context: any,
  ): Promise<PredictionBatch> {
    const user = context.req.user;
    return this.batchService.generateBulkPredictions(user, input);
  }

  @Query(() => PredictionBatch, { nullable: true })
  async predictionBatch(@Args('batchId') batchId: string): Promise<PredictionBatch> {
    return this.batchService.findById(batchId);
  }

  @Query(() => [PredictionBatch])
  async predictionBatches(@Context() context: any): Promise<PredictionBatch[]> {
    const user = context.req.user;
    return this.batchService.findUserBatches(user.id);
  }

  @Query(() => BatchStatistics)
  async batchStatistics(@Args('batchId') batchId: string): Promise<BatchStatistics> {
    return this.batchService.getBatchStatistics(batchId);
  }

  @Mutation(() => PredictionBatch)
  async cancelBatch(
    @Args('batchId') batchId: string,
    @Context() context: any,
  ): Promise<PredictionBatch> {
    const user = context.req.user;
    return this.batchService.cancelBatch(batchId, user.id);
  }

  @Mutation(() => PredictionBatch)
  async retryBatch(
    @Args('batchId') batchId: string,
    @Context() context: any,
  ): Promise<PredictionBatch> {
    const user = context.req.user;
    return this.batchService.retryBatch(batchId, user.id);
  }
}
