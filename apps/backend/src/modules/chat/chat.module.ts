import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';

// Services
import { ChatService } from './services/chat.service';
import { ConversationService } from './services/conversation.service';
import { ChatToolsService } from './services/chat-tools.service';
import { ChatNlpService } from './services/chat-nlp.service';
import { ChatPlannerLlmService } from './services/chat-planner-llm.service';
import { ChatToolsInitService } from './services/chat-tools-init.service';

// Resolvers
import { ChatResolver } from './resolvers/chat.resolver';
import { ConversationResolver } from './resolvers/conversation.resolver';

// Tools
import { MatchesTool } from './tools/matches.tool';
import { LiveMatchesTool } from './tools/live-matches.tool';
import { MatchDetailsTool } from './tools/match-details.tool';
import { PredictionTool } from './tools/prediction.tool';
import { TeamStatsTool } from './tools/team-stats.tool';
import { LeagueStandingsTool } from './tools/league-standings.tool';

// Other modules
import { SportsModule } from '@/modules/sports/sports.module';
import { PredictionsModule } from '@/modules/predictions/predictions.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ChatMessage]),
    SportsModule,
    PredictionsModule,
    UsersModule,
  ],
  providers: [
    // Services
    ChatService,
    ConversationService,
    ChatToolsService,
    ChatNlpService,
    ChatPlannerLlmService,
    ChatToolsInitService,

    // Resolvers
    ChatResolver,
    ConversationResolver,

    // Tools
    MatchesTool,
    LiveMatchesTool,
    MatchDetailsTool,
    PredictionTool,
    TeamStatsTool,
    LeagueStandingsTool,
  ],
  exports: [ChatService, ConversationService],
})
export class ChatModule {}
