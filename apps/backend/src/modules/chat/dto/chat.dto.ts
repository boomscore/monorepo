/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ChatMessage } from '../entities/chat-message.entity';
import { Conversation } from '../entities/conversation.entity';

@InputType()
export class SendMessageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customSystemPrompt?: string;
}

@InputType()
export class CreateConversationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

@ObjectType()
export class SendMessageResponse {
  @Field(() => ChatMessage)
  userMessage: ChatMessage;

  @Field(() => ChatMessage)
  assistantMessage: ChatMessage;

  @Field(() => Conversation)
  conversation: Conversation;
}
