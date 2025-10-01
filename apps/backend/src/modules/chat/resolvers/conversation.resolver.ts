/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Conversation } from '../entities/conversation.entity';
import { CreateConversationInput } from '../dto/chat.dto';

@Resolver(() => Conversation)
@UseGuards(JwtAuthGuard)
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @Mutation(() => Conversation)
  async createConversation(
    @Args('input', { type: () => CreateConversationInput }) input: CreateConversationInput,
    @Context() context: any,
  ): Promise<Conversation> {
    const user = context.req.user;
    return this.conversationService.create(user, input);
  }

  @Query(() => [Conversation])
  async myConversations(@Context() context: any): Promise<Conversation[]> {
    const user = context.req.user;
    return this.conversationService.findAll(user);
  }

  @Query(() => Conversation, { nullable: true })
  async getConversation(@Args('id') id: string, @Context() context: any): Promise<Conversation> {
    const user = context.req.user;
    return this.conversationService.findById(id, user);
  }

  @Mutation(() => Conversation)
  async updateConversation(
    @Args('id') id: string,
    @Args('title', { nullable: true }) title: string,
    @Args('systemPrompt', { nullable: true }) systemPrompt: string,
    @Context() context: any,
  ): Promise<Conversation> {
    const user = context.req.user;
    return this.conversationService.update(id, user, { title, systemPrompt });
  }

  @Mutation(() => Boolean)
  async deleteConversation(@Args('id') id: string, @Context() context: any): Promise<boolean> {
    const user = context.req.user;
    await this.conversationService.delete(id, user);
    return true;
  }
}
