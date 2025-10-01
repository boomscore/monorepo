/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/common/services/logger.service';
import { MetricsService } from '@/metrics/metrics.service';
import OpenAI from 'openai';

interface PredictionRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

interface PredictionResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
  finishReason: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ChatCompletionRequest {
  messages: Array<
    | {
        role: 'system' | 'user' | 'assistant';
        content: string;
        tool_calls?: ToolCall[];
      }
    | {
        role: 'tool';
        content: string;
        tool_call_id: string;
      }
  >;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }>;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

interface ChatCompletionResponse {
  content: string | null;
  toolCalls: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
  finishReason: string;
}

@Injectable()
export class OpenAIProviderService {
  private readonly openai: OpenAI;
  private readonly model: string = 'gpt-5'; // Updated to GPT-5!
  private readonly costPer1kTokens = {
    'gpt-5': { input: 0.03, output: 0.06 }, // GPT-5 pricing (estimated)
    'gpt-4o': { input: 0.025, output: 0.05 }, // GPT-4o pricing
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generatePrediction(request: PredictionRequest): Promise<PredictionResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        response_format:
          request.responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
      });

      const usage = completion.usage!;
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);
      const duration = Date.now() - startTime;

      this.logger.info('OpenAI prediction generated', {
        service: 'openai-provider',
        model: this.model,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost: cost.toFixed(6),
        duration: `${duration}ms`,
      });

      this.metricsService.recordDatabaseQueryDuration('openai-prediction', duration);

      return {
        content: completion.choices[0].message.content || '',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        model: this.model,
        finishReason: completion.choices[0].finish_reason || 'unknown',
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('OpenAI prediction failed', error.stack, {
        service: 'openai-provider',
        duration: `${duration}ms`,
        error: error.message,
      });

      throw error;
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: request.messages,
        tools: request.tools,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1500,
        response_format:
          request.responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
      });

      const choice = completion.choices[0];
      const usage = completion.usage!;
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);
      const duration = Date.now() - startTime;

      this.logger.info('OpenAI chat completion', {
        service: 'openai-provider',
        model: this.model,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost: cost.toFixed(6),
        duration: `${duration}ms`,
        hasToolCalls: !!choice.message.tool_calls?.length,
      });

      this.metricsService.recordDatabaseQueryDuration('openai-chat-completion', duration);

      return {
        content: choice.message.content,
        toolCalls:
          choice.message.tool_calls?.map(tc => ({
            id: tc.id,
            type: tc.type,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })) || [],
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        model: this.model,
        finishReason: choice.finish_reason || 'unknown',
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('OpenAI chat completion failed', error.stack, {
        service: 'openai-provider',
        duration: `${duration}ms`,
        error: error.message,
      });

      throw error;
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    const modelPricing = this.costPer1kTokens[this.model] || this.costPer1kTokens['gpt-5'];

    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      this.logger.error('OpenAI API key validation failed', error.stack);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return Object.keys(this.costPer1kTokens);
  }

  getModelPricing(model?: string): { input: number; output: number } | null {
    const targetModel = model || this.model;
    return this.costPer1kTokens[targetModel] || null;
  }

  getCurrentModel(): string {
    return this.model;
  }

  // Method to estimate cost before making a request
  estimateCost(promptLength: number, expectedCompletionLength: number = 500): number {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedPromptTokens = Math.ceil(promptLength / 4);
    const estimatedCompletionTokens = Math.ceil(expectedCompletionLength / 4);

    return this.calculateCost(estimatedPromptTokens, estimatedCompletionTokens);
  }
}
