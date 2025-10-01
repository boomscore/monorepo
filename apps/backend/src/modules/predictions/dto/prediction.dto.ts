/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsString, IsOptional, IsBoolean, IsEnum, IsUUID, IsDate } from 'class-validator';
import { PredictionType, PredictionStatus } from '../entities/prediction.entity';

@InputType()
export class GeneratePredictionInput {
  @Field()
  @IsUUID()
  matchId: string;

  @Field(() => [PredictionType])
  @IsArray()
  @IsEnum(PredictionType, { each: true })
  predictionTypes: PredictionType[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scenario?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeReasoning?: boolean;
}

@InputType()
export class BulkPredictionFiltersInput {
  @Field()
  @IsDate()
  dateFrom: Date;

  @Field()
  @IsDate()
  dateTo: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  leagueIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  excludeStarted?: boolean;
}

@InputType()
export class GenerateBulkPredictionsInput {
  @Field(() => BulkPredictionFiltersInput)
  filters: BulkPredictionFiltersInput;

  @Field(() => [PredictionType])
  @IsArray()
  @IsEnum(PredictionType, { each: true })
  predictionTypes: PredictionType[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scenario?: string;
}

@InputType()
export class PredictionFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  matchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => PredictionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PredictionStatus)
  status?: PredictionStatus;

  @Field(() => PredictionType, { nullable: true })
  @IsOptional()
  @IsEnum(PredictionType)
  type?: PredictionType;

  @Field({ nullable: true })
  @IsOptional()
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  dateTo?: Date;
}

@ObjectType()
export class PredictionAnalytics {
  @Field()
  totalPredictions: number;

  @Field()
  correctPredictions: number;

  @Field()
  accuracy: number;

  @Field()
  averageConfidence: number;

  @Field(() => [PredictionTypeAnalytics])
  byType: PredictionTypeAnalytics[];
}

@ObjectType()
export class PredictionTypeAnalytics {
  @Field(() => PredictionType)
  type: PredictionType;

  @Field()
  total: number;

  @Field()
  correct: number;

  @Field()
  accuracy: number;
}

@ObjectType()
export class BatchStatistics {
  @Field()
  totalMatches: number;

  @Field()
  completedPredictions: number;

  @Field()
  failedPredictions: number;

  @Field()
  averageConfidence: number;

  @Field()
  estimatedCost: number;

  @Field()
  processingTime: number;
}
