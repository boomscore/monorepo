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
import { SportsQueryService } from './services/sports-query.service';
import { SportsSyncService } from './services/sports-sync.service';

// Resolvers
import { SportsResolver } from './resolvers/sports.resolver';
import { LeaguesResolver } from './resolvers/leagues.resolver';
import { TeamsResolver } from './resolvers/teams.resolver';
import { MatchesResolver } from './resolvers/matches.resolver';

// Controllers
import { SportsSyncController } from './controllers/sports-sync.controller';
import { FixturesController } from './controllers/fixtures.controller';
import { LeaguesSyncController } from './controllers/leagues-sync.controller';

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
  controllers: [SportsSyncController, FixturesController, LeaguesSyncController],
  providers: [
    // Services
    SportsService,
    LeaguesService,
    TeamsService,
    MatchesService,
    SportsApiService,
    SportsIngestionService,
    SportsQueryService,
    SportsSyncService,

    // Resolvers
    SportsResolver,
    LeaguesResolver,
    TeamsResolver,
    MatchesResolver,
  ],
  exports: [
    SportsService,
    LeaguesService,
    TeamsService,
    MatchesService,
    SportsApiService,
    SportsIngestionService,
    SportsQueryService,
    SportsSyncService,
  ],
})
export class SportsModule {}
