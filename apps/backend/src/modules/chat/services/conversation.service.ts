/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { User } from '@/modules/users/entities/user.entity';
import { LoggerService } from '@/common/services/logger.service';
import { CreateConversationInput } from '../dto/chat.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly logger: LoggerService,
  ) {}

  async create(user: User, input: CreateConversationInput): Promise<Conversation> {
    this.logger.info('Creating new conversation', {
      service: 'conversation',
      userId: user.id,
    });

    const conversation = this.conversationRepository.create({
      userId: user.id,
      title: input.title || 'New Conversation',
      systemPrompt: input.systemPrompt,
    });

    return this.conversationRepository.save(conversation);
  }

  async findById(id: string, user: User): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId: user.id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  async findAll(user: User): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async update(
    id: string,
    user: User,
    updates: Partial<Pick<Conversation, 'title' | 'systemPrompt'>>,
  ): Promise<Conversation> {
    const conversation = await this.findById(id, user);

    Object.assign(conversation, updates);
    conversation.updatedAt = new Date();

    return this.conversationRepository.save(conversation);
  }

  async delete(id: string, user: User): Promise<void> {
    const conversation = await this.findById(id, user);
    await this.conversationRepository.remove(conversation);

    this.logger.info('Conversation deleted', {
      service: 'conversation',
      conversationId: id,
      userId: user.id,
    });
  }

  async getUserConversationCount(userId: string): Promise<number> {
    return this.conversationRepository.count({
      where: { userId },
    });
  }

  async getRecentConversations(user: User, limit = 10): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }
}
