/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatTool, ToolExecutionContext } from '../services/chat-tools.service';
import { PredictionsService } from '@/modules/predictions/services/predictions.service';
import {
  PredictionType,
  PredictionOutcome,
} from '@/modules/predictions/entities/prediction.entity';

@Injectable()
export class PredictionTool implements ChatTool {
  name = 'generate_prediction';
  description =
    'Generate AI predictions for a specific match with confidence scores and reasoning.';
  parameters = {
    type: 'object',
    properties: {
      matchId: {
        type: 'string',
        description: 'ID of the match to generate predictions for',
      },
      predictionTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: Object.values(PredictionType),
        },
        description: 'Types of predictions to generate',
        default: ['MATCH_WINNER', 'BOTH_TEAMS_SCORE', 'OVER_UNDER'],
      },
      scenario: {
        type: 'string',
        description: 'Optional scenario or context to consider for predictions',
      },
      includeReasoning: {
        type: 'boolean',
        default: true,
        description: 'Whether to include detailed reasoning for predictions',
      },
    },
    required: ['matchId'],
  };

  constructor(private readonly predictionsService: PredictionsService) {}

  async execute(args: any, context: ToolExecutionContext): Promise<any> {
    const {
      matchId,
      predictionTypes = [
        PredictionType.MATCH_WINNER,
        PredictionType.BOTH_TEAMS_SCORE,
        PredictionType.OVER_UNDER,
      ],
      scenario,
      includeReasoning = true,
    } = args;

    const predictions = await this.predictionsService.generatePrediction(
      // TODO: Get user from context - for now using mock user
      { id: context.userId } as any,
      {
        matchId,
        predictionTypes,
        scenario,
        includeReasoning,
      },
    );

    return {
      predictions: predictions.map(prediction => ({
        type: prediction.type,
        outcome: prediction.outcome,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
        odds: prediction.odds,
        displayText: prediction.displayText,
      })),
      match: {
        id: predictions[0]?.match.id,
        homeTeam: predictions[0]?.match.homeTeam.name,
        awayTeam: predictions[0]?.match.awayTeam.name,
        league: predictions[0]?.match.league.name,
        startTime: predictions[0]?.match.startTime,
      },
      generatedAt: new Date().toISOString(),
      scenario: scenario || null,
    };
  }
}
