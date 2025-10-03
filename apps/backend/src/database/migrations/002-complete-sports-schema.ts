/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteSportsSchema1700000000002 implements MigrationInterface {
  name = 'CompleteSportsSchema1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leagueId" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "slug" character varying(150) NOT NULL,
        "shortName" character varying(150),
        "code" character varying(10),
        "country" character varying(100) NOT NULL,
        "countryCode" character varying(10),
        "logo" character varying(255),
        "venue" character varying(255),
        "venueAddress" character varying(255),
        "venueCapacity" integer,
        "venueImage" character varying(255),
        "apiId" integer NOT NULL,
        "venueId" integer,
        "isActive" boolean NOT NULL DEFAULT true,
        "founded" integer,
        "isNational" boolean NOT NULL DEFAULT false,
        "colors" jsonb,
        "form" jsonb,
        "statistics" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teams_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_teams_apiId" UNIQUE ("apiId"),
        CONSTRAINT "FK_teams_leagueId" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE
      )
    `);

    // Create matches table
    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leagueId" uuid NOT NULL,
        "seasonId" uuid,
        "homeTeamId" uuid NOT NULL,
        "awayTeamId" uuid NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "status" "match_status_enum" NOT NULL DEFAULT 'SCHEDULED',
        "result" "match_result_enum" NOT NULL DEFAULT 'PENDING',
        "homeScore" integer,
        "awayScore" integer,
        "homeHalfTimeScore" integer,
        "awayHalfTimeScore" integer,
        "homeExtraTimeScore" integer,
        "awayExtraTimeScore" integer,
        "homePenaltyScore" integer,
        "awayPenaltyScore" integer,
        "minute" integer,
        "period" character varying(20),
        "venue" character varying(255),
        "referee" character varying(100),
        "attendance" integer,
        "weather" character varying(50),
        "apiId" integer NOT NULL,
        "round" integer,
        "roundName" character varying(100),
        "isFeatured" boolean NOT NULL DEFAULT false,
        "finishedAt" TIMESTAMP,
        "odds" jsonb,
        "statistics" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_matches" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_matches_apiId" UNIQUE ("apiId"),
        CONSTRAINT "FK_matches_leagueId" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_matches_seasonId" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_matches_homeTeamId" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_matches_awayTeamId" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);

    // Create match_events table
    await queryRunner.query(`
      CREATE TABLE "match_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "matchId" uuid NOT NULL,
        "teamId" uuid,
        "playerId" uuid,
        "type" "match_event_type_enum" NOT NULL,
        "minute" integer NOT NULL,
        "extraTime" integer,
        "description" character varying(500),
        "playerName" character varying(100),
        "assistPlayerName" character varying(100),
        "detail" character varying(200),
        "comments" character varying(500),
        "isHome" boolean NOT NULL,
        "coordinates" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_match_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_match_events_matchId" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_match_events_teamId" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL
      )
    `);

    // Create predictions table
    await queryRunner.query(`
      CREATE TABLE "predictions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "matchId" uuid NOT NULL,
        "batchId" uuid,
        "type" "prediction_type_enum" NOT NULL,
        "outcome" "prediction_outcome_enum" NOT NULL,
        "value" character varying(100),
        "odds" numeric(10,2),
        "stake" numeric(10,2),
        "potentialPayout" numeric(10,2),
        "actualPayout" numeric(10,2),
        "status" "prediction_status_enum" NOT NULL DEFAULT 'PENDING',
        "confidence" integer,
        "reasoning" jsonb,
        "aiAnalysis" jsonb,
        "settledAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_predictions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_predictions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_predictions_matchId" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE
      )
    `);

    // Create prediction_batches table
    await queryRunner.query(`
      CREATE TABLE "prediction_batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying(100),
        "description" character varying(500),
        "status" "batch_status_enum" NOT NULL DEFAULT 'PENDING',
        "totalStake" numeric(10,2) NOT NULL DEFAULT 0,
        "totalPotentialPayout" numeric(10,2) NOT NULL DEFAULT 0,
        "totalActualPayout" numeric(10,2) NOT NULL DEFAULT 0,
        "totalOdds" numeric(10,2) NOT NULL DEFAULT 1,
        "correctPredictions" integer NOT NULL DEFAULT 0,
        "totalPredictions" integer NOT NULL DEFAULT 0,
        "isProcessed" boolean NOT NULL DEFAULT false,
        "processedAt" TIMESTAMP,
        "settledAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prediction_batches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_prediction_batches_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying(200),
        "isActive" boolean NOT NULL DEFAULT true,
        "messageCount" integer NOT NULL DEFAULT 0,
        "lastMessageAt" TIMESTAMP,
        "context" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_conversations_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create chat_messages table
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversationId" uuid NOT NULL,
        "role" "chat_message_role_enum" NOT NULL,
        "content" text NOT NULL,
        "toolCalls" jsonb,
        "toolResults" jsonb,
        "tokens" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_chat_messages_conversationId" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE
      )
    `);

    // Create subscriptions table
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "plan" "subscription_plan_enum" NOT NULL,
        "status" "subscription_status_enum" NOT NULL DEFAULT 'PENDING',
        "billingCycle" "billing_cycle_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "cancelledAt" TIMESTAMP,
        "pausedAt" TIMESTAMP,
        "trialEnds" TIMESTAMP,
        "nextBillingDate" TIMESTAMP,
        "autoRenew" boolean NOT NULL DEFAULT true,
        "paymentMethodId" character varying(255),
        "externalId" character varying(255),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscriptions_externalId" UNIQUE ("externalId"),
        CONSTRAINT "FK_subscriptions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "subscriptionId" uuid,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "method" "payment_method_enum" NOT NULL,
        "type" "payment_type_enum" NOT NULL,
        "reference" character varying(255) NOT NULL,
        "externalReference" character varying(255),
        "gatewayResponse" jsonb,
        "failureReason" character varying(500),
        "paidAt" TIMESTAMP,
        "refundedAt" TIMESTAMP,
        "refundAmount" numeric(10,2),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_reference" UNIQUE ("reference"),
        CONSTRAINT "FK_payments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_subscriptionId" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL
      )
    `);

    // Add missing foreign key to predictions table for batch relationship
    await queryRunner.query(`
      ALTER TABLE "predictions" 
      ADD CONSTRAINT "FK_predictions_batchId" 
      FOREIGN KEY ("batchId") REFERENCES "prediction_batches"("id") ON DELETE SET NULL
    `);

    // Update leagues table to add missing countryFlag column
    await queryRunner.query(`
      ALTER TABLE "leagues" 
      ADD COLUMN "countryFlag" character varying(255)
    `);

    // Create comprehensive indexes
    await queryRunner.query(`CREATE INDEX "IDX_teams_leagueId" ON "teams" ("leagueId")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_country" ON "teams" ("country")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_apiId" ON "teams" ("apiId")`);

    await queryRunner.query(`CREATE INDEX "IDX_matches_leagueId" ON "matches" ("leagueId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_seasonId" ON "matches" ("seasonId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_homeTeamId" ON "matches" ("homeTeamId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_awayTeamId" ON "matches" ("awayTeamId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_startTime" ON "matches" ("startTime")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_status" ON "matches" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_apiId" ON "matches" ("apiId")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_matches_startTime_status" ON "matches" ("startTime", "status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_match_events_matchId" ON "match_events" ("matchId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_match_events_teamId" ON "match_events" ("teamId")`);
    await queryRunner.query(`CREATE INDEX "IDX_match_events_type" ON "match_events" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_match_events_minute" ON "match_events" ("minute")`);

    await queryRunner.query(`CREATE INDEX "IDX_predictions_userId" ON "predictions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_predictions_matchId" ON "predictions" ("matchId")`);
    await queryRunner.query(`CREATE INDEX "IDX_predictions_batchId" ON "predictions" ("batchId")`);
    await queryRunner.query(`CREATE INDEX "IDX_predictions_status" ON "predictions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_predictions_type" ON "predictions" ("type")`);

    await queryRunner.query(
      `CREATE INDEX "IDX_prediction_batches_userId" ON "prediction_batches" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_prediction_batches_status" ON "prediction_batches" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_userId" ON "conversations" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_isActive" ON "conversations" ("isActive")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_conversationId" ON "chat_messages" ("conversationId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_chat_messages_role" ON "chat_messages" ("role")`);

    await queryRunner.query(
      `CREATE INDEX "IDX_subscriptions_userId" ON "subscriptions" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscriptions_endDate" ON "subscriptions" ("endDate")`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_payments_userId" ON "payments" ("userId")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_subscriptionId" ON "payments" ("subscriptionId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_reference" ON "payments" ("reference")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of dependencies
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "predictions"`);
    await queryRunner.query(`DROP TABLE "prediction_batches"`);
    await queryRunner.query(`DROP TABLE "match_events"`);
    await queryRunner.query(`DROP TABLE "matches"`);
    await queryRunner.query(`DROP TABLE "teams"`);

    // Remove added column
    await queryRunner.query(`ALTER TABLE "leagues" DROP COLUMN "countryFlag"`);
  }
}
