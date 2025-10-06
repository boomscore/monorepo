import { Injectable } from '@nestjs/common';
import { OpenAIProviderService } from '@/modules/predictions/services/openai-provider.service';
import { LoggerService } from '@/common/services/logger.service';

export interface NlpIntentResult {
  category: string;
  confidence: number;
  entities: { [key: string]: string };
}

export interface NlpAnalysisResult {
  entities: string[];
  intent: NlpIntentResult;
  hints?: {
    wantsPrediction?: boolean;
    wantsLineups?: boolean;
    wantsLive?: boolean;
    dateHints?: string[];
    vsPair?: { home: string; away: string } | null;
  };
}

@Injectable()
export class ChatNlpService {
  constructor(
    private readonly openaiProvider: OpenAIProviderService,
    private readonly logger: LoggerService,
  ) {}

  async analyze(message: string): Promise<NlpAnalysisResult> {
    const system = `You are an NER and intent classifier for football chat. Extract:
- entities: array of strings (team names, keywords like prediction, live, lineups, dates like YYYY-MM-DD, today, tomorrow)
- intent: { category: one of [prediction, match_info, team_info, league_info, statistics, general], confidence: 0..1, entities: key->value map }
- hints: { wantsPrediction, wantsLineups, wantsLive, dateHints: array of strings, vsPair: {home, away} | null }
Return strict JSON only.`;

    const result = await this.openaiProvider.chatCompletion({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
      temperature: 0,
      maxTokens: 600,
      responseFormat: 'json_object',
    });

    try {
      const content = result.content || '{}';
      const parsed = JSON.parse(content);

      // Minimal validation and defaults
      const analysis: NlpAnalysisResult = {
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        intent: parsed.intent || { category: 'general', confidence: 0.5, entities: {} },
        hints: parsed.hints || {},
      };

      return analysis;
    } catch (error) {
      this.logger.error('ChatNlpService analyze JSON parse failed', (error as any).stack, {
        service: 'chat-nlp',
      });
      return {
        entities: [],
        intent: { category: 'general', confidence: 0.5, entities: {} },
      };
    }
  }
}
