/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// Entities
import { Prediction } from './entities/prediction.entity';
import { PredictionBatch } from './entities/prediction-batch.entity';
import { Match } from '@/modules/sports/entities/match.entity';
import { User } from '@/modules/users/entities/user.entity';

// Services
import { PredictionsService } from './services/predictions.service';
import { PredictionBatchService } from './services/prediction-batch.service';
import { PromptService } from './services/prompt.service';
import { OpenAIProviderService } from './services/openai-provider.service';

// Resolvers
import { PredictionsResolver } from './resolvers/predictions.resolver';
import { PredictionBatchResolver } from './resolvers/prediction-batch.resolver';

// Workers
import { PredictionProcessor } from './workers/prediction.processor';

// Other modules
import { SportsModule } from '@/modules/sports/sports.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, PredictionBatch, Match, User]),
    BullModule.registerQueue({
      name: 'predictions-bulk',
    }),
    SportsModule,
    UsersModule,
  ],
  providers: [
    // Services
    PredictionsService,
    PredictionBatchService,
    PromptService,
    OpenAIProviderService,

    // Resolvers
    PredictionsResolver,
    PredictionBatchResolver,

    // Workers
    PredictionProcessor,
  ],
  exports: [PredictionsService, PredictionBatchService, PromptService, OpenAIProviderService],
})
export class PredictionsModule {}
