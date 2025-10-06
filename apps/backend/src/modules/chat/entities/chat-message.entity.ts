import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Conversation } from './conversation.entity';

export enum ChatMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
  TOOL = 'TOOL',
}

registerEnumType(ChatMessageRole, {
  name: 'ChatMessageRole',
  description: 'Role of the chat message sender',
});

@Entity('chat_messages')
@ObjectType()
@Index(['conversationId'])
@Index(['role'])
@Index(['createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  conversationId: string;

  @Column({
    type: 'enum',
    enum: ChatMessageRole,
  })
  @Field(() => ChatMessageRole)
  role: ChatMessageRole;

  @Column({ type: 'text' })
  @Field()
  content: string;

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  tokens?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @Field({ nullable: true })
  cost?: number; // Cost in USD

  @Column({ type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  responseTime?: number; // Response time in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  toolCalls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  toolResults?: {
    toolCallId: string;
    result: any;
    error?: string;
    executionTime?: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => [String], { nullable: true })
  entities?: string[]; // Named entities extracted from the message

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  intent?: {
    category: string; // prediction, information, analysis, etc.
    confidence: number;
    entities: { [key: string]: string };
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  context?: {
    matches?: string[]; // Match IDs referenced in the message
    teams?: string[]; // Team IDs referenced
    leagues?: string[]; // League IDs referenced
    predictions?: string[]; // Prediction IDs referenced
    previousMessages?: number; // Number of previous messages used as context
  };

  @Column({ type: 'boolean', default: false })
  @Field()
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  @Column({ type: 'text', nullable: true })
  originalContent?: string; // Store original content if edited

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    finishReason?: string;
    userAgent?: string;
    ipAddress?: string;
    language?: string;
    sentiment?: {
      score: number;
      label: string;
    };
  };

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  @Field(() => Conversation)
  conversation: Conversation;

  // Helper methods
  @Field()
  get isUser(): boolean {
    return this.role === ChatMessageRole.USER;
  }

  @Field()
  get isAssistant(): boolean {
    return this.role === ChatMessageRole.ASSISTANT;
  }

  @Field()
  get isSystem(): boolean {
    return this.role === ChatMessageRole.SYSTEM;
  }

  @Field()
  get isTool(): boolean {
    return this.role === ChatMessageRole.TOOL;
  }

  @Field()
  get hasToolCalls(): boolean {
    return !!(this.toolCalls && this.toolCalls.length > 0);
  }

  @Field()
  get wordCount(): number {
    return this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  @Field()
  get characterCount(): number {
    return this.content.length;
  }

  @Field({ nullable: true })
  get estimatedReadingTime(): number | null {
    // Average reading speed: 200 words per minute
    const words = this.wordCount;
    if (words === 0) return null;
    return Math.ceil((words / 200) * 60); // Return seconds
  }

  @Field()
  get containsCode(): boolean {
    return this.content.includes('```') || this.content.includes('`');
  }

  @Field()
  get containsLinks(): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(this.content);
  }

  @Field(() => [String])
  get extractedUrls(): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = this.content.match(urlRegex);
    return matches || [];
  }

  @Field(() => [String])
  get mentionedTeams(): string[] {
    return this.context?.teams || [];
  }

  @Field(() => [String])
  get mentionedMatches(): string[] {
    return this.context?.matches || [];
  }

  @Field({ nullable: true })
  get primaryIntent(): string | null {
    return this.intent?.category || null;
  }

  @Field({ nullable: true })
  get sentimentScore(): number | null {
    return this.metadata?.sentiment?.score || null;
  }

  @Field({ nullable: true })
  get sentimentLabel(): string | null {
    return this.metadata?.sentiment?.label || null;
  }

  edit(newContent: string): void {
    if (this.content !== newContent) {
      this.originalContent = this.content;
      this.content = newContent;
      this.isEdited = true;
      this.editedAt = new Date();
    }
  }

  addToolCall(toolCall: any): void {
    if (!this.toolCalls) this.toolCalls = [];
    this.toolCalls.push(toolCall);
  }

  addToolResult(toolCallId: string, result: any, error?: string, executionTime?: number): void {
    if (!this.toolResults) this.toolResults = [];
    this.toolResults.push({
      toolCallId,
      result,
      error,
      executionTime,
    });
  }



  analyzeSentiment(): void {
    // Simple sentiment analysis
    const content = this.content.toLowerCase();
    let score = 0;
    let label = 'neutral';

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'win', 'victory'];
    const negativeWords = ['bad', 'terrible', 'awful', 'lose', 'loss', 'defeat', 'disappointed'];

    positiveWords.forEach(word => {
      if (content.includes(word)) score += 0.1;
    });

    negativeWords.forEach(word => {
      if (content.includes(word)) score -= 0.1;
    });

    if (score > 0.1) {
      label = 'positive';
    } else if (score < -0.1) {
      label = 'negative';
    }

    if (!this.metadata) this.metadata = {};
    this.metadata.sentiment = { score, label };
  }
}
