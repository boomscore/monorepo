/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatMessageRole } from '../entities/chat-message.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '@/modules/users/entities/user.entity';
import { LoggerService } from '@/common/services/logger.service';
import { ChatToolsService } from './chat-tools.service';
import { ChatPlannerService } from './chat-planner.service';
import { OpenAIProviderService } from '@/modules/predictions/services/openai-provider.service';

export interface SendMessageInput {
  conversationId?: string;
  message: string;
  customSystemPrompt?: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  conversation: Conversation;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly logger: LoggerService,
    private readonly chatToolsService: ChatToolsService,
    private readonly chatPlannerService: ChatPlannerService,
    private readonly openaiProvider: OpenAIProviderService,
  ) {}

  async sendMessage(user: User, input: SendMessageInput): Promise<SendMessageResponse> {
    this.logger.info('Processing chat message', {
      service: 'chat',
      userId: user.id,
      conversationId: input.conversationId,
      messageLength: input.message.length,
    });

    // Get or create conversation
    let conversation: Conversation;
    if (input.conversationId) {
      conversation = await this.getConversation(input.conversationId, user);
    } else {
      conversation = await this.createConversation(user, input.message);
    }

    // Create user message
    const userMessage = await this.createMessage(
      conversation,
      user,
      input.message,
      ChatMessageRole.USER,
    );

    // Process message and generate response
    const assistantResponse = await this.processMessage(
      conversation,
      input.message,
      input.customSystemPrompt,
    );

    // Create assistant message
    const assistantMessage = await this.createMessage(
      conversation,
      null,
      assistantResponse,
      ChatMessageRole.ASSISTANT,
    );

    // Update conversation
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return {
      userMessage,
      assistantMessage,
      conversation,
    };
  }

  async getConversations(user: User): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getConversation(id: string, user: User): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId: user.id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  private async createConversation(user: User, firstMessage: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      userId: user.id,
      title: this.generateConversationTitle(firstMessage),
    });

    return this.conversationRepository.save(conversation);
  }

  private async createMessage(
    conversation: Conversation,
    user: User | null,
    content: string,
    role: ChatMessageRole,
  ): Promise<ChatMessage> {
    const message = this.chatMessageRepository.create({
      conversationId: conversation.id,
      content,
      role,
    });

    return await this.chatMessageRepository.save(message);
  }

  private async processMessage(
    conversation: Conversation,
    message: string,
    customSystemPrompt?: string,
  ): Promise<string> {
    try {
      // Get conversation history
      const messages = await this.getConversationMessages(conversation.id);

      // Plan tool usage
      const toolPlan = await this.chatPlannerService.planTools(message, messages);

      // Execute tools if needed
      let toolResults = [];
      if (toolPlan.tools.length > 0) {
        toolResults = await this.executeTools(toolPlan.tools, message);
      }

      // Generate response
      const systemPrompt = this.buildSystemPrompt(customSystemPrompt, toolResults);

      const response = await this.openaiProvider.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role:
              msg.role === ChatMessageRole.USER
                ? ('user' as const)
                : msg.role === ChatMessageRole.ASSISTANT
                  ? ('assistant' as const)
                  : ('system' as const),
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        maxTokens: 1500,
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to process chat message', error.stack, {
        service: 'chat',
        conversationId: conversation.id,
      });

      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  private async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: 20, // Last 20 messages for context
    });
  }

  private async executeTools(
    tools: string[],
    query: string,
  ): Promise<Array<{ tool: string; result: any }>> {
    const results = [];

    for (const toolName of tools) {
      try {
        const context = {
          userId: 'system',
          conversationId: 'temp',
          messageId: 'temp',
        }; // TODO: Pass actual user context
        const result = await this.chatToolsService.executeTool(toolName, query, context);
        results.push({ tool: toolName, result });
      } catch (error) {
        this.logger.error(`Tool execution failed: ${toolName}`, error.stack, {
          service: 'chat',
          tool: toolName,
        });
      }
    }

    return results;
  }

  private buildSystemPrompt(
    customPrompt?: string,
    toolResults?: Array<{ tool: string; result: any }>,
  ): string {
    let prompt = `You are BoomScore AI, an intelligent sports assistant specializing in football predictions and analysis.

You help users with:
- Sports data analysis and insights
- Match predictions and betting odds
- Live scores and match updates
- Team and player statistics
- Historical data analysis

Guidelines:
- Be helpful, accurate, and professional
- Use data-driven insights when available
- Acknowledge uncertainty when making predictions
- Never guarantee betting outcomes
- Provide clear, concise responses`;

    if (customPrompt) {
      prompt = `${customPrompt}\n\n${prompt}`;
    }

    if (toolResults && toolResults.length > 0) {
      prompt += '\n\nAvailable context from tools:\n';
      for (const { tool, result } of toolResults) {
        prompt += `\n${tool}: ${JSON.stringify(result, null, 2)}`;
      }
    }

    return prompt;
  }

  private generateConversationTitle(firstMessage: string): string {
    // Simple title generation - take first 50 chars
    const title = firstMessage.substring(0, 50);
    return title.length < firstMessage.length ? `${title}...` : title;
  }
}
