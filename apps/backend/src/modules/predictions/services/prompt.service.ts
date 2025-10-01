/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/services/logger.service';
import { Match } from '@/modules/sports/entities/match.entity';
import { Team } from '@/modules/sports/entities/team.entity';
import { PredictionType } from '../entities/prediction.entity';

interface PredictionContext {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  scenario?: string;
  includeReasoning?: boolean;
  predictionTypes: PredictionType[];
  recentMatches?: {
    home: any[];
    away: any[];
    headToHead: any[];
  };
  teamStatistics?: {
    home: any;
    away: any;
  };
  injuries?: string[];
  weather?: string;
  venue?: string;
}

interface PredictionPrompt {
  systemPrompt: string;
  userPrompt: string;
  fullPrompt: string;
  context: PredictionContext;
  responseFormat: 'text' | 'json_object';
}

@Injectable()
export class PromptService {
  constructor(private readonly logger: LoggerService) {}

  generatePredictionPrompt(context: PredictionContext): PredictionPrompt {
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(context);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    this.logger.info('Generated prediction prompt', {
      service: 'prompt',
      matchId: context.match.id,
      promptLength: fullPrompt.length,
      predictionTypes: context.predictionTypes,
      hasScenario: !!context.scenario,
    });

    return {
      systemPrompt,
      userPrompt,
      fullPrompt,
      context,
      responseFormat: 'json_object',
    };
  }

  private buildSystemPrompt(context: PredictionContext): string {
    return `You are an expert football (soccer) analyst with deep knowledge of teams, players, tactics, and match dynamics. You analyze matches using statistical data, team form, head-to-head records, and contextual factors to make accurate predictions.

IMPORTANT GUIDELINES:
- Provide predictions based on data and analysis, not speculation
- Consider team form, injuries, venue factors, and historical performance
- Be honest about uncertainty - football is unpredictable
- Always provide confidence scores between 0-100
- Include reasoning for your predictions when requested
- Consider the specific scenario provided by the user
- Use current season data when available
- Account for venue advantages (home/away performance)

RESPONSE FORMAT:
You must respond with a valid JSON object containing predictions. Each prediction should include:
- type: The prediction type
- outcome: Your predicted outcome
- confidence: Confidence score (0-100)
- reasoning: Brief explanation of your reasoning
- odds: Estimated fair odds if applicable

SAFETY GUIDELINES:
- Never guarantee outcomes or suggest betting
- Acknowledge that sports outcomes are uncertain
- Base predictions on available data, not rumors
- Clearly state when data is insufficient`;
  }

  private buildUserPrompt(context: PredictionContext): string {
    const sections: string[] = [];

    // Match information
    sections.push(this.buildMatchSection(context));

    // Team information
    sections.push(this.buildTeamSection(context));

    // Statistics section
    if (context.teamStatistics) {
      sections.push(this.buildStatisticsSection(context));
    }

    // Recent form section
    if (context.recentMatches) {
      sections.push(this.buildRecentFormSection(context));
    }

    // Additional context
    sections.push(this.buildContextSection(context));

    // Prediction request
    sections.push(this.buildPredictionRequestSection(context));

    return sections.join('\n\n');
  }

  private buildMatchSection(context: PredictionContext): string {
    const { match, homeTeam, awayTeam } = context;
    
    return `MATCH ANALYSIS REQUEST

Match: ${homeTeam.name} vs ${awayTeam.name}
League: ${match.league.name}
Date: ${match.startTime.toISOString()}
Venue: ${match.venue || homeTeam.venue || 'Unknown'}
${match.round ? `Round: ${match.round}` : ''}`;
  }

  private buildTeamSection(context: PredictionContext): string {
    const { homeTeam, awayTeam } = context;
    
    let section = `TEAM INFORMATION

HOME TEAM: ${homeTeam.name}
- Country: ${homeTeam.country}
- Venue: ${homeTeam.venue || 'Unknown'}
${homeTeam.founded ? `- Founded: ${homeTeam.founded}` : ''}
${homeTeam.statistics ? `- League Position: ${homeTeam.statistics.position || 'N/A'}` : ''}

AWAY TEAM: ${awayTeam.name}
- Country: ${awayTeam.country}
- Venue: ${awayTeam.venue || 'Unknown'}
${awayTeam.founded ? `- Founded: ${awayTeam.founded}` : ''}
${awayTeam.statistics ? `- League Position: ${awayTeam.statistics.position || 'N/A'}` : ''}`;

    // Add team form if available
    if (homeTeam.form || awayTeam.form) {
      section += `\n\nRECENT FORM:`;
      if (homeTeam.form) {
        section += `\n- ${homeTeam.name}: ${homeTeam.form.slice(-5).join('')} (last 5 matches)`;
      }
      if (awayTeam.form) {
        section += `\n- ${awayTeam.name}: ${awayTeam.form.slice(-5).join('')} (last 5 matches)`;
      }
    }

    return section;
  }

  private buildStatisticsSection(context: PredictionContext): string {
    const { teamStatistics, homeTeam, awayTeam } = context;
    
    let section = `SEASON STATISTICS`;

    if (teamStatistics?.home) {
      const stats = teamStatistics.home;
      section += `\n\n${homeTeam.name} (Home):
- Matches Played: ${stats.played || 'N/A'}
- Wins: ${stats.wins || 'N/A'}
- Draws: ${stats.draws || 'N/A'}  
- Losses: ${stats.losses || 'N/A'}
- Goals For: ${stats.goalsFor || 'N/A'}
- Goals Against: ${stats.goalsAgainst || 'N/A'}
- Points: ${stats.points || 'N/A'}`;
    }

    if (teamStatistics?.away) {
      const stats = teamStatistics.away;
      section += `\n\n${awayTeam.name} (Away):
- Matches Played: ${stats.played || 'N/A'}
- Wins: ${stats.wins || 'N/A'}
- Draws: ${stats.draws || 'N/A'}
- Losses: ${stats.losses || 'N/A'}
- Goals For: ${stats.goalsFor || 'N/A'}
- Goals Against: ${stats.goalsAgainst || 'N/A'}
- Points: ${stats.points || 'N/A'}`;
    }

    return section;
  }

  private buildRecentFormSection(context: PredictionContext): string {
    const { recentMatches, homeTeam, awayTeam } = context;
    let section = `RECENT MATCHES`;

    if (recentMatches?.home && recentMatches.home.length > 0) {
      section += `\n\n${homeTeam.name} Last 5 Matches:`;
      recentMatches.home.slice(0, 5).forEach((match, index) => {
        section += `\n${index + 1}. ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} (${match.result})`;
      });
    }

    if (recentMatches?.away && recentMatches.away.length > 0) {
      section += `\n\n${awayTeam.name} Last 5 Matches:`;
      recentMatches.away.slice(0, 5).forEach((match, index) => {
        section += `\n${index + 1}. ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} (${match.result})`;
      });
    }

    if (recentMatches?.headToHead && recentMatches.headToHead.length > 0) {
      section += `\n\nHEAD-TO-HEAD (Last 5 Meetings):`;
      recentMatches.headToHead.slice(0, 5).forEach((match, index) => {
        section += `\n${index + 1}. ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} (${match.date})`;
      });
    }

    return section;
  }

  private buildContextSection(context: PredictionContext): string {
    const sections: string[] = [];

    if (context.injuries && context.injuries.length > 0) {
      sections.push(`INJURY UPDATES:
${context.injuries.map(injury => `- ${injury}`).join('\n')}`);
    }

    if (context.weather) {
      sections.push(`WEATHER CONDITIONS: ${context.weather}`);
    }

    if (context.scenario) {
      sections.push(`USER SCENARIO: ${context.scenario}`);
    }

    return sections.length > 0 ? `ADDITIONAL CONTEXT\n\n${sections.join('\n\n')}` : '';
  }

  private buildPredictionRequestSection(context: PredictionContext): string {
    const predictionDescriptions = {
      [PredictionType.MATCH_WINNER]: 'Match Winner (Home Win/Draw/Away Win)',
      [PredictionType.BOTH_TEAMS_SCORE]: 'Both Teams to Score (Yes/No)',
      [PredictionType.OVER_UNDER]: 'Over/Under 2.5 Goals',
      [PredictionType.CORRECT_SCORE]: 'Correct Score Prediction',
      [PredictionType.TOTAL_GOALS]: 'Total Goals (0-1, 2-3, 4+)',
      [PredictionType.HANDICAP]: 'Handicap Betting',
      [PredictionType.DOUBLE_CHANCE]: 'Double Chance (1X, 12, X2)',
      [PredictionType.HALF_TIME_RESULT]: 'Half Time Result',
      [PredictionType.CLEAN_SHEET]: 'Clean Sheet (Yes/No for each team)',
      [PredictionType.WIN_TO_NIL]: 'Win to Nil',
      [PredictionType.GOALS_ODD_EVEN]: 'Total Goals Odd/Even',
    };

    const requestedPredictions = context.predictionTypes
      .map(type => predictionDescriptions[type] || type)
      .join('\n- ');

    let section = `PREDICTION REQUEST

Please provide predictions for the following markets:
- ${requestedPredictions}

Requirements:
- Analyze all available data above
- Provide confidence scores (0-100) for each prediction
- ${context.includeReasoning ? 'Include detailed reasoning for each prediction' : 'Include brief reasoning for each prediction'}
- Consider venue advantage and team form
- Account for any injuries or missing players
- Be realistic about uncertainty levels

Response must be valid JSON with this structure:
{
  "predictions": [
    {
      "type": "MATCH_WINNER",
      "outcome": "HOME_WIN|AWAY_WIN|DRAW",
      "confidence": 75,
      "reasoning": "Brief explanation...",
      "odds": 2.5
    }
  ],
  "summary": "Overall match assessment...",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
}`;

    return section;
  }

  // Method to generate chat system prompt for conversations
  generateChatSystemPrompt(): string {
    return `You are an expert sports analyst specializing in football (soccer) with access to real-time match data, team statistics, and prediction tools. You help users understand sports data, analyze matches, and generate predictions.

CAPABILITIES:
- Access live and historical match data
- Analyze team performance and statistics  
- Generate predictions with confidence scores
- Explain betting odds and markets
- Provide head-to-head analysis
- Track team form and injuries

TOOLS AVAILABLE:
- fetch_matches: Get match information by date, league, or team
- fetch_live_matches: Get currently live matches
- fetch_match_details: Get detailed match information including events
- generate_prediction: Generate AI predictions for specific matches

GUIDELINES:
- Always provide data-driven insights
- Be transparent about prediction confidence
- Explain your reasoning clearly
- Suggest realistic betting strategies when asked
- Acknowledge when information is unavailable
- Focus on analysis, not speculation
- Help users understand complex sports concepts

SAFETY:
- Never guarantee outcomes
- Encourage responsible approach to sports betting
- Remind users that sports are unpredictable
- Provide educational content about odds and probability`;
  }

  // Method to generate scenario-specific prompts for complex queries
  generateComplexQueryPrompt(query: string): string {
    const scenarios = {
      'draw games': 'Focus on matches with high draw probability based on team defensive strength, recent form, and head-to-head draw frequency',
      'home win': 'Analyze home team advantages including venue records, recent home form, and opponent away weaknesses',
      'high certainty': 'Identify predictions with confidence > 80% based on clear statistical advantages and form differences',
      '3 odds': 'Find predictions with odds around 3.0 (33% probability) that offer good value based on analysis',
      'upset potential': 'Look for matches where the underdog has realistic chances based on recent form or matchup advantages',
      'goals markets': 'Focus on over/under and both teams to score markets using attacking/defensive statistics',
    };

    // Try to match query to known scenarios
    const lowerQuery = query.toLowerCase();
    for (const [scenario, instruction] of Object.entries(scenarios)) {
      if (lowerQuery.includes(scenario)) {
        return `COMPLEX QUERY ANALYSIS

User Query: "${query}"

Special Instructions: ${instruction}

Please provide a comprehensive analysis addressing the user's specific request. Include:
1. Matching criteria based on current data
2. Statistical reasoning for selections
3. Risk assessment and confidence levels
4. Recommended approach for the user's strategy

Focus on matches and predictions that best fit the user's query while maintaining analytical rigor.`;
      }
    }

    // Default complex query handling
    return `COMPLEX QUERY ANALYSIS

User Query: "${query}"

Please provide a comprehensive analysis addressing this request. Consider:
1. Available match data and statistics
2. Relevant prediction markets
3. Risk factors and confidence levels
4. Strategic recommendations

Provide specific examples and clear reasoning for your recommendations.`;
  }
}
