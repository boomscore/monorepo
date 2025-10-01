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
import { ObjectType, Field, ID, registerEnumType, Int, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '@/modules/users/entities/user.entity';
import { Prediction } from './prediction.entity';

export enum BatchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(BatchStatus, {
  name: 'BatchStatus',
  description: 'Status of prediction batch processing',
});

@Entity('prediction_batches')
@ObjectType()
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class PredictionBatch {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 200, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({ length: 1000, nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.PENDING,
  })
  @Field(() => BatchStatus)
  status: BatchStatus;

  @Column({ type: 'jsonb' })
  @Field(() => GraphQLJSON)
  filters: {
    dateFrom?: string;
    dateTo?: string;
    leagueIds?: string[];
    teamIds?: string[];
    excludeStarted?: boolean;
    minOdds?: number;
    maxOdds?: number;
    onlyFeatured?: boolean;
  };

  @Column({ type: 'jsonb' })
  @Field(() => [String])
  predictionTypes: string[]; // Array of PredictionType

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  scenario?: string;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  totalMatches: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  processedMatches: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  totalPredictions: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  successfulPredictions: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  failedPredictions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  averageConfidence?: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  estimatedCompletionAt?: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  progress?: {
    currentMatch?: number;
    currentLeague?: string;
    stage?: string;
    percentage?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  summary?: {
    correctPredictions?: number;
    incorrectPredictions?: number;
    pendingPredictions?: number;
    accuracy?: number;
    profitLoss?: number;
    bestPerformingType?: string;
    worstPerformingType?: string;
    highestConfidence?: number;
    lowestConfidence?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.predictionBatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @OneToMany(() => Prediction, prediction => prediction.batch)
  @Field(() => [Prediction])
  predictions: Prediction[];

  // Helper methods
  @Field()
  get isProcessing(): boolean {
    return this.status === BatchStatus.PROCESSING;
  }

  @Field()
  get isCompleted(): boolean {
    return this.status === BatchStatus.COMPLETED;
  }

  @Field()
  get isFailed(): boolean {
    return this.status === BatchStatus.FAILED;
  }

  @Field()
  get isPending(): boolean {
    return this.status === BatchStatus.PENDING;
  }

  @Field(() => Float)
  get completionPercentage(): number {
    if (this.totalMatches === 0) return 0;
    return (this.processedMatches / this.totalMatches) * 100;
  }

  @Field({ nullable: true })
  get estimatedTimeRemaining(): number | null {
    if (!this.startedAt || !this.estimatedCompletionAt) return null;

    const now = new Date();
    const remaining = this.estimatedCompletionAt.getTime() - now.getTime();

    return Math.max(0, remaining);
  }

  @Field({ nullable: true })
  get actualDuration(): number | null {
    if (!this.startedAt) return null;

    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  @Field()
  get statusText(): string {
    switch (this.status) {
      case BatchStatus.PENDING:
        return 'Waiting to start';
      case BatchStatus.PROCESSING:
        return `Processing (${this.completionPercentage.toFixed(1)}%)`;
      case BatchStatus.COMPLETED:
        return 'Completed';
      case BatchStatus.FAILED:
        return 'Failed';
      case BatchStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  start(): void {
    this.status = BatchStatus.PROCESSING;
    this.startedAt = new Date();
    this.errorMessage = null;
  }

  updateProgress(processed: number, total?: number, stage?: string): void {
    this.processedMatches = processed;
    if (total !== undefined) {
      this.totalMatches = total;
    }

    this.progress = {
      ...this.progress,
      currentMatch: processed,
      stage,
      percentage: this.completionPercentage,
    };

    // Update estimated completion time
    if (this.startedAt && processed > 0 && this.totalMatches > 0) {
      const elapsed = Date.now() - this.startedAt.getTime();
      const rate = processed / elapsed; // matches per ms
      const remaining = this.totalMatches - processed;
      const estimatedRemainingTime = remaining / rate;

      this.estimatedCompletionAt = new Date(Date.now() + estimatedRemainingTime);
    }
  }

  complete(): void {
    this.status = BatchStatus.COMPLETED;
    this.completedAt = new Date();
    this.progress = {
      ...this.progress,
      percentage: 100,
      stage: 'Completed',
    };

    // Calculate summary statistics
    this.updateSummary();
  }

  fail(error: string): void {
    this.status = BatchStatus.FAILED;
    this.errorMessage = error;
    this.completedAt = new Date();
  }

  cancel(): void {
    this.status = BatchStatus.CANCELLED;
    this.completedAt = new Date();
  }

  private updateSummary(): void {
    if (!this.predictions) return;

    const correct = this.predictions.filter(p => p.status === 'CORRECT').length;
    const incorrect = this.predictions.filter(p => p.status === 'INCORRECT').length;
    const pending = this.predictions.filter(p => p.status === 'PENDING').length;
    const total = correct + incorrect;

    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Calculate profit/loss
    const profitLoss = this.predictions
      .filter(p => p.profitLoss !== null)
      .reduce((sum, p) => sum + (p.profitLoss || 0), 0);

    // Find best and worst performing prediction types
    const typeStats = new Map<string, { correct: number; total: number }>();
    this.predictions.forEach(p => {
      if (p.status === 'CORRECT' || p.status === 'INCORRECT') {
        const current = typeStats.get(p.type) || { correct: 0, total: 0 };
        current.total++;
        if (p.status === 'CORRECT') current.correct++;
        typeStats.set(p.type, current);
      }
    });

    let bestType = '';
    let worstType = '';
    let bestAccuracy = -1;
    let worstAccuracy = 101;

    typeStats.forEach((stats, type) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestType = type;
      }
      if (accuracy < worstAccuracy) {
        worstAccuracy = accuracy;
        worstType = type;
      }
    });

    // Confidence statistics
    const confidences = this.predictions.map(p => p.confidence).filter(c => c !== undefined);
    const highestConfidence = confidences.length > 0 ? Math.max(...confidences) : 0;
    const lowestConfidence = confidences.length > 0 ? Math.min(...confidences) : 0;

    this.summary = {
      correctPredictions: correct,
      incorrectPredictions: incorrect,
      pendingPredictions: pending,
      accuracy,
      profitLoss,
      bestPerformingType: bestType,
      worstPerformingType: worstType,
      highestConfidence,
      lowestConfidence,
    };
  }
}
