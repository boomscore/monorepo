/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertApiIdToString1700000000003 implements MigrationInterface {
  name = 'ConvertApiIdToString1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert apiId columns from integer to varchar(50)
    // We need to drop and recreate constraints that reference these columns

    // Drop existing unique constraints and indexes
    await queryRunner.query(`ALTER TABLE "sports" DROP CONSTRAINT IF EXISTS "UQ_sports_apiId"`);
    await queryRunner.query(`ALTER TABLE "leagues" DROP CONSTRAINT IF EXISTS "UQ_leagues_apiId"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "UQ_teams_apiId"`);
    await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "UQ_matches_apiId"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sports_apiId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_apiId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_matches_apiId"`);

    // Convert the columns to varchar, casting existing integer values to strings
    await queryRunner.query(
      `ALTER TABLE "sports" ALTER COLUMN "apiId" TYPE VARCHAR(50) USING "apiId"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "leagues" ALTER COLUMN "apiId" TYPE VARCHAR(50) USING "apiId"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "apiId" TYPE VARCHAR(50) USING "apiId"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" ALTER COLUMN "apiId" TYPE VARCHAR(50) USING "apiId"::text`,
    );

    // Recreate unique constraints
    await queryRunner.query(
      `ALTER TABLE "sports" ADD CONSTRAINT "UQ_sports_apiId" UNIQUE ("apiId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "leagues" ADD CONSTRAINT "UQ_leagues_apiId" UNIQUE ("apiId")`,
    );
    await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "UQ_teams_apiId" UNIQUE ("apiId")`);
    await queryRunner.query(
      `ALTER TABLE "matches" ADD CONSTRAINT "UQ_matches_apiId" UNIQUE ("apiId")`,
    );

    // Recreate indexes
    await queryRunner.query(`CREATE INDEX "IDX_sports_apiId" ON "sports" ("apiId")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_apiId" ON "teams" ("apiId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_apiId" ON "matches" ("apiId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to integer type
    // Drop constraints and indexes first
    await queryRunner.query(`ALTER TABLE "sports" DROP CONSTRAINT IF EXISTS "UQ_sports_apiId"`);
    await queryRunner.query(`ALTER TABLE "leagues" DROP CONSTRAINT IF EXISTS "UQ_leagues_apiId"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "UQ_teams_apiId"`);
    await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "UQ_matches_apiId"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sports_apiId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_apiId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_matches_apiId"`);

    // Convert back to integer (this assumes all values are numeric)
    await queryRunner.query(
      `ALTER TABLE "sports" ALTER COLUMN "apiId" TYPE INTEGER USING "apiId"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "leagues" ALTER COLUMN "apiId" TYPE INTEGER USING "apiId"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "apiId" TYPE INTEGER USING "apiId"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" ALTER COLUMN "apiId" TYPE INTEGER USING "apiId"::integer`,
    );

    // Recreate constraints and indexes
    await queryRunner.query(
      `ALTER TABLE "sports" ADD CONSTRAINT "UQ_sports_apiId" UNIQUE ("apiId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "leagues" ADD CONSTRAINT "UQ_leagues_apiId" UNIQUE ("apiId")`,
    );
    await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "UQ_teams_apiId" UNIQUE ("apiId")`);
    await queryRunner.query(
      `ALTER TABLE "matches" ADD CONSTRAINT "UQ_matches_apiId" UNIQUE ("apiId")`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_sports_apiId" ON "sports" ("apiId")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_apiId" ON "teams" ("apiId")`);
    await queryRunner.query(`CREATE INDEX "IDX_matches_apiId" ON "matches" ("apiId")`);
  }
}
