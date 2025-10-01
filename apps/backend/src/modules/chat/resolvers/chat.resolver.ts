/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ChatMessage } from '../entities/chat-message.entity';
import { Conversation } from '../entities/conversation.entity';
import { SendMessageInput, SendMessageResponse } from '../dto/chat.dto';

@Resolver(() => ChatMessage)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => SendMessageResponse)
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: any,
  ): Promise<SendMessageResponse> {
    const user = context.req.user;
    return this.chatService.sendMessage(user, input);
  }

  @Query(() => [Conversation])
  async conversations(@Context() context: any): Promise<Conversation[]> {
    const user = context.req.user;
    return this.chatService.getConversations(user);
  }

  @Query(() => Conversation, { nullable: true })
  async conversation(@Args('id') id: string, @Context() context: any): Promise<Conversation> {
    const user = context.req.user;
    return this.chatService.getConversation(id, user);
  }
}
