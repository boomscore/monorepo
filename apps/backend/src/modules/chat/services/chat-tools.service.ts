/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/services/logger.service';

// Tool interfaces
export interface ChatTool {
  name: string;
  description: string;
  parameters: any;
  execute(args: any, context: any): Promise<any>;
}

export interface ToolExecutionContext {
  userId: string;
  conversationId: string;
  messageId: string;
}

export interface ToolExecutionResult {
  toolCallId: string;
  result: any;
  error?: string;
  executionTime: number;
}

@Injectable()
export class ChatToolsService {
  private tools: Map<string, ChatTool> = new Map();

  constructor(private readonly logger: LoggerService) {}

  registerTool(tool: ChatTool): void {
    this.tools.set(tool.name, tool);
    this.logger.info('Chat tool registered', {
      service: 'chat-tools',
      toolName: tool.name,
    });
  }

  getTool(name: string): ChatTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ChatTool[] {
    return Array.from(this.tools.values());
  }

  getToolDefinitions(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }> {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async executeTool(
    toolName: string,
    args: any,
    context: ToolExecutionContext,
  ): Promise<any> {
    const startTime = Date.now();
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    try {
      this.logger.info('Executing chat tool', {
        service: 'chat-tools',
        toolName,
        args,
        userId: context.userId,
        conversationId: context.conversationId,
      });

      const result = await tool.execute(args, context);
      const executionTime = Date.now() - startTime;

      this.logger.info('Chat tool executed successfully', {
        service: 'chat-tools',
        toolName,
        executionTime: `${executionTime}ms`,
        resultType: typeof result,
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.logger.error('Chat tool execution failed', error.stack, {
        service: 'chat-tools',
        toolName,
        args,
        executionTime: `${executionTime}ms`,
        error: error.message,
      });

      throw error;
    }
  }

  async executeMultipleTools(
    toolCalls: Array<{
      id: string;
      name: string;
      arguments: string;
    }>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];

    for (const toolCall of toolCalls) {
      const startTime = Date.now();
      
      try {
        const args = JSON.parse(toolCall.arguments);
        const result = await this.executeTool(toolCall.name, args, context);
        
        results.push({
          toolCallId: toolCall.id,
          result,
          executionTime: Date.now() - startTime,
        });

      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          result: null,
          error: error.message,
          executionTime: Date.now() - startTime,
        });
      }
    }

    return results;
  }

  // Helper method to validate tool arguments
  validateToolArguments(toolName: string, args: any): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) return false;

    // Basic validation - in a real implementation, you'd use JSON schema validation
    const required = tool.parameters.required || [];
    for (const field of required) {
      if (!(field in args)) {
        return false;
      }
    }

    return true;
  }

  // Get tool usage statistics
  getToolStats(): {
    totalTools: number;
    toolNames: string[];
  } {
    return {
      totalTools: this.tools.size,
      toolNames: Array.from(this.tools.keys()),
    };
  }
}
