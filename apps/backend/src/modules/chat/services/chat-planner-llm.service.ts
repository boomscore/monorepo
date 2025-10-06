import { Injectable } from '@nestjs/common';
import { OpenAIProviderService } from '@/modules/predictions/services/openai-provider.service';
import { LoggerService } from '@/common/services/logger.service';
import { ChatToolsService } from './chat-tools.service';

export interface PlannedToolCall {
  name: string;
  arguments: any;
}

export interface PlannerResult {
  steps: PlannedToolCall[];
  reasoning: string;
}

@Injectable()
export class ChatPlannerLlmService {
  constructor(
    private readonly openaiProvider: OpenAIProviderService,
    private readonly chatTools: ChatToolsService,
    private readonly logger: LoggerService,
  ) {}

  async plan(query: string, hints?: Record<string, any>): Promise<PlannerResult> {
    const toolDefs = this.chatTools.getToolDefinitions();

    const system = `You plan tool calls for a football assistant. Return strict JSON with fields:
    { reasoning: string, steps: [{ name: string, arguments: object }] }
    - Use only these tools and their JSON schemas:
    ${JSON.stringify(toolDefs, null, 2)}
    - Prefer resolving matchId by calling fetch_matches with date/team hints before fetch_match_details or generate_prediction.
    - If user asks for lineups, include fetch_match_details.
    - Keep arguments minimal and valid per schema.`;

    const userMsg = {
      query,
      hints: hints || {},
    };

    const completion = await this.openaiProvider.chatCompletion({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(userMsg) },
      ],
      temperature: 0,
      maxTokens: 800,
      responseFormat: 'json_object',
    });

    try {
      const content = completion.content || '{}';
      const parsed = JSON.parse(content);
      const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
      // Basic validation: only allow registered tools
      const allowed = new Set(this.chatTools.getAllTools().map(t => t.name));
      const filtered = steps.filter(
        (s: any) => allowed.has(s.name) && typeof s.arguments === 'object',
      );
      return {
        steps: filtered,
        reasoning: parsed.reasoning || '',
      };
    } catch (error) {
      this.logger.error('ChatPlannerLlmService JSON parse failed', (error as any).stack, {
        service: 'chat-planner-llm',
      });
      return { steps: [], reasoning: 'Failed to parse planner output' };
    }
  }
}
