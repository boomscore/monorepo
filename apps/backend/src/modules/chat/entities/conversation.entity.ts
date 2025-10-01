/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '@/modules/users/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('conversations')
@ObjectType()
@Index(['userId'])
@Index(['isActive'])
@Index(['updatedAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 200, nullable: true })
  @Field({ nullable: true })
  title?: string;

  @Column({ length: 1000, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  systemPrompt?: string; // Custom system prompt for this conversation

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @Field()
  isPinned: boolean;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  tokensUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  @Field()
  estimatedCost: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastMessageAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    toolsEnabled?: boolean;
    language?: string;
    timezone?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  summary?: {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    toolCalls: number;
    avgResponseTime: number;
    topics: string[];
    predictions: number;
    matches: number;
  };

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.conversations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @OneToMany(() => ChatMessage, message => message.conversation, {
    cascade: true,
    eager: false,
  })
  @Field(() => [ChatMessage])
  messages: ChatMessage[];

  // Helper methods
  @Field()
  get displayTitle(): string {
    if (this.title) return this.title;

    // Generate title from first user message
    const firstUserMessage = this.messages?.find(m => m.role === 'USER');
    if (firstUserMessage) {
      const truncated = firstUserMessage.content.substring(0, 50);
      return truncated.length < firstUserMessage.content.length ? `${truncated}...` : truncated;
    }

    return `Conversation ${this.id.substring(0, 8)}`;
  }

  @Field({ nullable: true })
  get lastMessage(): ChatMessage | null {
    if (!this.messages || this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1];
  }

  @Field()
  get duration(): number {
    if (!this.lastMessageAt) return 0;
    return this.lastMessageAt.getTime() - this.createdAt.getTime();
  }

  @Field()
  get isRecent(): boolean {
    if (!this.lastMessageAt) return false;
    const hoursSinceLastMessage = (Date.now() - this.lastMessageAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastMessage < 24;
  }

  @Field({ nullable: true })
  get estimatedCostUSD(): number | null {
    return this.estimatedCost;
  }

  addMessage(message: ChatMessage): void {
    if (!this.messages) this.messages = [];
    this.messages.push(message);
    this.messageCount = this.messages.length;
    this.lastMessageAt = new Date();

    // Update token usage and cost
    if (message.tokens) {
      this.tokensUsed += message.tokens;
    }

    if (message.cost) {
      this.estimatedCost += message.cost;
    }
  }

  updateSummary(): void {
    if (!this.messages) return;

    const userMessages = this.messages.filter(m => m.role === 'USER');
    const assistantMessages = this.messages.filter(m => m.role === 'ASSISTANT');
    const toolMessages = this.messages.filter(m => m.toolCalls?.length > 0);

    const totalResponseTime = assistantMessages
      .filter(m => m.responseTime)
      .reduce((sum, m) => sum + (m.responseTime || 0), 0);

    const avgResponseTime =
      assistantMessages.length > 0 ? totalResponseTime / assistantMessages.length : 0;

    // Extract topics/entities mentioned
    const topics = new Set<string>();
    this.messages.forEach(message => {
      if (message.entities) {
        message.entities.forEach(entity => topics.add(entity));
      }
    });

    // Count predictions and match references
    let predictions = 0;
    let matchReferences = 0;

    this.messages.forEach(message => {
      if (message.content.toLowerCase().includes('predict')) predictions++;
      if (message.content.toLowerCase().includes('match')) matchReferences++;
    });

    this.summary = {
      totalMessages: this.messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      toolCalls: toolMessages.length,
      avgResponseTime,
      topics: Array.from(topics).slice(0, 10), // Top 10 topics
      predictions,
      matches: matchReferences,
    };
  }

  archive(): void {
    this.isActive = false;
  }

  pin(): void {
    this.isPinned = true;
  }

  unpin(): void {
    this.isPinned = false;
  }

  setCustomSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  clearCustomSystemPrompt(): void {
    this.systemPrompt = null;
  }
}
