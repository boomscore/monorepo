/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';

// Entities
import { Sport } from './entities/sport.entity';
import { League } from './entities/league.entity';
import { Season } from './entities/season.entity';
import { Team } from './entities/team.entity';
import { Match } from './entities/match.entity';
import { MatchEvent } from './entities/match-event.entity';

// Services
import { SportsService } from './services/sports.service';
import { LeaguesService } from './services/leagues.service';
import { TeamsService } from './services/teams.service';
import { MatchesService } from './services/matches.service';
import { SportsApiService } from './services/sports-api.service';
import { SportsIngestionService } from './services/sports-ingestion.service';

// Resolvers
import { SportsResolver } from './resolvers/sports.resolver';
import { LeaguesResolver } from './resolvers/leagues.resolver';
import { TeamsResolver } from './resolvers/teams.resolver';
import { MatchesResolver } from './resolvers/matches.resolver';

// Workers
import { SportsIngestionProcessor } from './workers/sports-ingestion.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sport, League, Season, Team, Match, MatchEvent]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    BullModule.registerQueue({
      name: 'ingestion',
    }),
  ],
  providers: [
    // Services
    SportsService,
    LeaguesService,
    TeamsService,
    MatchesService,
    SportsApiService,
    SportsIngestionService,

    // Resolvers
    SportsResolver,
    LeaguesResolver,
    TeamsResolver,
    MatchesResolver,

    // Workers
    SportsIngestionProcessor,
  ],
  exports: [
    SportsService,
    LeaguesService,
    TeamsService,
    MatchesService,
    SportsApiService,
    SportsIngestionService,
  ],
})
export class SportsModule {}
