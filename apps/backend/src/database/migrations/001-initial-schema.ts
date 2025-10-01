/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000001 implements MigrationInterface {
  name = 'InitialSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('USER', 'MODERATOR', 'ADMIN')`);
    await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED')`);
    await queryRunner.query(`CREATE TYPE "subscription_plan_enum" AS ENUM('FREE', 'PRO', 'ULTRA')`);
    await queryRunner.query(`CREATE TYPE "device_type_enum" AS ENUM('DESKTOP', 'MOBILE', 'TABLET', 'OTHER')`);
    await queryRunner.query(`CREATE TYPE "device_status_enum" AS ENUM('TRUSTED', 'UNTRUSTED', 'BLOCKED')`);
    await queryRunner.query(`CREATE TYPE "session_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED')`);
    await queryRunner.query(`CREATE TYPE "refresh_token_status_enum" AS ENUM('ACTIVE', 'USED', 'REVOKED', 'EXPIRED')`);
    await queryRunner.query(`CREATE TYPE "league_type_enum" AS ENUM('LEAGUE', 'CUP', 'PLAYOFFS', 'FRIENDLY', 'QUALIFICATION')`);
    await queryRunner.query(`CREATE TYPE "match_status_enum" AS ENUM('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED', 'ABANDONED', 'SUSPENDED')`);
    await queryRunner.query(`CREATE TYPE "match_result_enum" AS ENUM('HOME_WIN', 'AWAY_WIN', 'DRAW', 'PENDING')`);
    await queryRunner.query(`CREATE TYPE "match_event_type_enum" AS ENUM('GOAL', 'OWN_GOAL', 'PENALTY_GOAL', 'MISSED_PENALTY', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'CORNER', 'FREE_KICK', 'OFFSIDE', 'FOUL', 'INJURY', 'VAR', 'KICKOFF', 'HALFTIME', 'FULLTIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT')`);
    await queryRunner.query(`CREATE TYPE "prediction_type_enum" AS ENUM('MATCH_WINNER', 'BOTH_TEAMS_SCORE', 'OVER_UNDER', 'HANDICAP', 'CORRECT_SCORE', 'FIRST_GOAL_SCORER', 'TOTAL_GOALS', 'HALF_TIME_RESULT', 'DOUBLE_CHANCE', 'DRAW_NO_BET', 'CLEAN_SHEET', 'WIN_TO_NIL', 'GOALS_ODD_EVEN', 'TEAM_TOTAL_GOALS', 'CORNERS', 'CARDS')`);
    await queryRunner.query(`CREATE TYPE "prediction_outcome_enum" AS ENUM('HOME_WIN', 'AWAY_WIN', 'DRAW', 'OVER', 'UNDER', 'YES', 'NO', 'ODD', 'EVEN', 'CUSTOM')`);
    await queryRunner.query(`CREATE TYPE "prediction_status_enum" AS ENUM('PENDING', 'CORRECT', 'INCORRECT', 'VOID', 'PUSH')`);
    await queryRunner.query(`CREATE TYPE "batch_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
    await queryRunner.query(`CREATE TYPE "chat_message_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM', 'TOOL')`);
    await queryRunner.query(`CREATE TYPE "subscription_status_enum" AS ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED', 'PENDING', 'TRIALING')`);
    await queryRunner.query(`CREATE TYPE "billing_cycle_enum" AS ENUM('MONTHLY', 'QUARTERLY', 'YEARLY')`);
    await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')`);
    await queryRunner.query(`CREATE TYPE "payment_method_enum" AS ENUM('CARD', 'BANK_TRANSFER', 'USSD', 'QR', 'MOBILE_MONEY')`);
    await queryRunner.query(`CREATE TYPE "payment_type_enum" AS ENUM('SUBSCRIPTION', 'ONE_TIME', 'RENEWAL', 'UPGRADE', 'DOWNGRADE')`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "username" character varying(100) NOT NULL,
        "password" character varying(255) NOT NULL,
        "firstName" character varying(100),
        "lastName" character varying(100),
        "avatar" character varying(255),
        "phoneNumber" character varying(20),
        "dateOfBirth" date,
        "country" character varying(100),
        "timezone" character varying(10),
        "preferredLanguage" character varying(10),
        "role" "user_role_enum" NOT NULL DEFAULT 'USER',
        "status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "subscriptionPlan" "subscription_plan_enum" NOT NULL DEFAULT 'FREE',
        "subscriptionExpiresAt" TIMESTAMP,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "emailVerifiedAt" TIMESTAMP,
        "phoneVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "lastLoginIp" inet,
        "preferences" jsonb,
        "metadata" jsonb,
        "monthlyPredictions" integer NOT NULL DEFAULT 0,
        "monthlyChatMessages" integer NOT NULL DEFAULT 0,
        "usagePeriodStart" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    // Create devices table
    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "fingerprint" character varying(255) NOT NULL,
        "name" character varying(100),
        "type" "device_type_enum" NOT NULL DEFAULT 'OTHER',
        "status" "device_status_enum" NOT NULL DEFAULT 'UNTRUSTED',
        "userAgent" character varying(255),
        "browser" character varying(100),
        "browserVersion" character varying(50),
        "os" character varying(100),
        "osVersion" character varying(50),
        "lastSeenIp" inet,
        "location" character varying(100),
        "lastSeenAt" TIMESTAMP,
        "trustedAt" TIMESTAMP,
        "blockedAt" TIMESTAMP,
        "blockedReason" character varying(500),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_devices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_devices_fingerprint" UNIQUE ("fingerprint"),
        CONSTRAINT "FK_devices_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create sessions table
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "deviceId" uuid,
        "token" character varying(255) NOT NULL,
        "status" "session_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" inet,
        "userAgent" character varying(255),
        "location" character varying(100),
        "lastActiveAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "revokedReason" character varying(500),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sessions_token" UNIQUE ("token"),
        CONSTRAINT "FK_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sessions_deviceId" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE
      )
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "token" character varying(255) NOT NULL,
        "status" "refresh_token_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" inet,
        "userAgent" character varying(255),
        "usedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "revokedReason" character varying(500),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token"),
        CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create sports table
    await queryRunner.query(`
      CREATE TABLE "sports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "description" character varying(500),
        "icon" character varying(255),
        "image" character varying(255),
        "apiId" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sports" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sports_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_sports_apiId" UNIQUE ("apiId")
      )
    `);

    // Create leagues table
    await queryRunner.query(`
      CREATE TABLE "leagues" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sportId" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "slug" character varying(150) NOT NULL,
        "description" character varying(500),
        "type" "league_type_enum" NOT NULL DEFAULT 'LEAGUE',
        "country" character varying(100) NOT NULL,
        "countryCode" character varying(10),
        "logo" character varying(255),
        "flag" character varying(255),
        "apiId" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "seasonStart" date,
        "seasonEnd" date,
        "currentSeason" integer,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leagues" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_leagues_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_leagues_apiId" UNIQUE ("apiId"),
        CONSTRAINT "FK_leagues_sportId" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE CASCADE
      )
    `);

    // Continue with more tables...
    await queryRunner.query(`
      CREATE TABLE "seasons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leagueId" uuid NOT NULL,
        "year" integer NOT NULL,
        "name" character varying(100) NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "isCurrent" boolean NOT NULL DEFAULT false,
        "isFinished" boolean NOT NULL DEFAULT false,
        "standings" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_seasons" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_seasons_league_year" UNIQUE ("leagueId", "year"),
        CONSTRAINT "FK_seasons_leagueId" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
    await queryRunner.query(`CREATE INDEX "IDX_devices_userId" ON "devices" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_devices_fingerprint" ON "devices" ("fingerprint")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_deviceId" ON "sessions" ("deviceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_expiresAt" ON "sessions" ("expiresAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expiresAt" ON "refresh_tokens" ("expiresAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_sports_slug" ON "sports" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_sports_apiId" ON "sports" ("apiId")`);
    await queryRunner.query(`CREATE INDEX "IDX_leagues_sportId" ON "leagues" ("sportId")`);
    await queryRunner.query(`CREATE INDEX "IDX_leagues_country" ON "leagues" ("country")`);
    await queryRunner.query(`CREATE INDEX "IDX_seasons_leagueId" ON "seasons" ("leagueId")`);
    await queryRunner.query(`CREATE INDEX "IDX_seasons_year" ON "seasons" ("year")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "seasons"`);
    await queryRunner.query(`DROP TABLE "leagues"`);
    await queryRunner.query(`DROP TABLE "sports"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "payment_type_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "billing_cycle_enum"`);
    await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "chat_message_role_enum"`);
    await queryRunner.query(`DROP TYPE "batch_status_enum"`);
    await queryRunner.query(`DROP TYPE "prediction_status_enum"`);
    await queryRunner.query(`DROP TYPE "prediction_outcome_enum"`);
    await queryRunner.query(`DROP TYPE "prediction_type_enum"`);
    await queryRunner.query(`DROP TYPE "match_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "match_result_enum"`);
    await queryRunner.query(`DROP TYPE "match_status_enum"`);
    await queryRunner.query(`DROP TYPE "league_type_enum"`);
    await queryRunner.query(`DROP TYPE "refresh_token_status_enum"`);
    await queryRunner.query(`DROP TYPE "session_status_enum"`);
    await queryRunner.query(`DROP TYPE "device_status_enum"`);
    await queryRunner.query(`DROP TYPE "device_type_enum"`);
    await queryRunner.query(`DROP TYPE "subscription_plan_enum"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
