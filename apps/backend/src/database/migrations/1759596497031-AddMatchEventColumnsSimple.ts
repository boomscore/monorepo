import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchEventColumnsSimple1759596497031 implements MigrationInterface {
    name = 'AddMatchEventColumnsSimple1759596497031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only add the columns if they don't exist
        const playerOutExists = await queryRunner.hasColumn("match_events", "playerOut");
        if (!playerOutExists) {
            await queryRunner.query(`ALTER TABLE "match_events" ADD "playerOut" character varying(100)`);
        }

        const playerInExists = await queryRunner.hasColumn("match_events", "playerIn");
        if (!playerInExists) {
            await queryRunner.query(`ALTER TABLE "match_events" ADD "playerIn" character varying(100)`);
        }

        const apiEventIdExists = await queryRunner.hasColumn("match_events", "apiEventId");
        if (!apiEventIdExists) {
            await queryRunner.query(`ALTER TABLE "match_events" ADD "apiEventId" integer`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_events" DROP COLUMN "apiEventId"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP COLUMN "playerIn"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP COLUMN "playerOut"`);
    }
}
