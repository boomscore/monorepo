/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ChatMessage } from '../entities/chat-message.entity';
import { LoggerService } from '@/common/services/logger.service';

export interface ToolPlan {
  tools: string[];
  reasoning: string;
}

@Injectable()
export class ChatPlannerService {
  private readonly availableTools = [
    'matches',
    'live-matches',
    'match-details',
    'team-stats',
    'league-standings',
    'prediction',
  ];

  constructor(private readonly logger: LoggerService) {}

  async planTools(query: string, conversationHistory: ChatMessage[] = []): Promise<ToolPlan> {
    const lowerQuery = query.toLowerCase();
    const selectedTools: string[] = [];
    let reasoning = 'Analyzing query for tool selection: ';

    // Match-related queries
    if (this.containsKeywords(lowerQuery, ['match', 'game', 'fixture', 'today', 'tomorrow'])) {
      if (this.containsKeywords(lowerQuery, ['live', 'current', 'now'])) {
        selectedTools.push('live-matches');
        reasoning += 'Live matches tool selected for real-time data. ';
      } else {
        selectedTools.push('matches');
        reasoning += 'Matches tool selected for fixture data. ';
      }
    }

    // Specific match details
    if (this.containsKeywords(lowerQuery, ['details', 'events', 'score', 'goals', 'cards'])) {
      selectedTools.push('match-details');
      reasoning += 'Match details tool selected for specific match information. ';
    }

    // Team statistics
    if (this.containsKeywords(lowerQuery, ['team', 'form', 'stats', 'statistics', 'performance'])) {
      selectedTools.push('team-stats');
      reasoning += 'Team stats tool selected for performance data. ';
    }

    // League standings
    if (this.containsKeywords(lowerQuery, ['table', 'standings', 'position', 'league'])) {
      selectedTools.push('league-standings');
      reasoning += 'League standings tool selected for table data. ';
    }

    // Prediction queries
    if (
      this.containsKeywords(lowerQuery, [
        'predict',
        'prediction',
        'bet',
        'odds',
        'chance',
        'probability',
        'win',
        'draw',
        'lose',
        'outcome',
        'result',
        'forecast',
      ])
    ) {
      selectedTools.push('prediction');
      reasoning += 'Prediction tool selected for analysis and forecasting. ';
    }

    // Complex queries might need multiple tools
    if (this.isComplexQuery(lowerQuery)) {
      // For complex queries, we might need base data first
      if (!selectedTools.includes('matches')) {
        selectedTools.unshift('matches');
        reasoning += 'Added matches tool for context. ';
      }
    }

    this.logger.info('Tool planning completed', {
      service: 'chat-planner',
      query: query.substring(0, 100),
      selectedTools,
      reasoning,
    });

    return {
      tools: [...new Set(selectedTools)], // Remove duplicates
      reasoning,
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private isComplexQuery(query: string): boolean {
    const complexIndicators = [
      'find me',
      'show me',
      'get me',
      'build me',
      'create',
      'all possible',
      'best',
      'high certainty',
      'multiple',
      'combination',
      'odds',
      'accumulator',
      'acca',
    ];

    return this.containsKeywords(query, complexIndicators) || query.split(' ').length > 8; // Long queries are often complex
  }

  getAvailableTools(): string[] {
    return [...this.availableTools];
  }

  getToolDescription(toolName: string): string {
    const descriptions = {
      matches: 'Fetches match fixtures and basic information',
      'live-matches': 'Gets currently live/ongoing matches',
      'match-details': 'Retrieves detailed match information including events',
      'team-stats': 'Provides team statistics and performance data',
      'league-standings': 'Shows league table and standings',
      prediction: 'Generates AI-powered match predictions and analysis',
    };

    return descriptions[toolName] || 'Tool description not available';
  }
}
