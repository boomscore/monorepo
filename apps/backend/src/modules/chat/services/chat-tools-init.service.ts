import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatToolsService } from './chat-tools.service';
import { MatchesTool } from '../tools/matches.tool';
import { LiveMatchesTool } from '../tools/live-matches.tool';
import { MatchDetailsTool } from '../tools/match-details.tool';
import { PredictionTool } from '../tools/prediction.tool';
import { TeamStatsTool } from '../tools/team-stats.tool';
import { LeagueStandingsTool } from '../tools/league-standings.tool';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class ChatToolsInitService implements OnModuleInit {
  constructor(
    private readonly chatToolsService: ChatToolsService,
    private readonly matchesTool: MatchesTool,
    private readonly liveMatchesTool: LiveMatchesTool,
    private readonly matchDetailsTool: MatchDetailsTool,
    private readonly predictionTool: PredictionTool,
    private readonly teamStatsTool: TeamStatsTool,
    private readonly leagueStandingsTool: LeagueStandingsTool,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    // Register all chat tools
    this.chatToolsService.registerTool(this.matchesTool);
    this.chatToolsService.registerTool(this.liveMatchesTool);
    this.chatToolsService.registerTool(this.matchDetailsTool);
    this.chatToolsService.registerTool(this.predictionTool);
    this.chatToolsService.registerTool(this.teamStatsTool);
    this.chatToolsService.registerTool(this.leagueStandingsTool);

    this.logger.info('All chat tools registered successfully', {
      service: 'chat-tools-init',
      toolCount: this.chatToolsService.getAllTools().length,
    });
  }
}
