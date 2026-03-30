import type { MigrationInterface, QueryRunner } from "typeorm";

export class WantedItems1711000000000 implements MigrationInterface {
  name = "WantedItems1711000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wanted_items" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "album_mbid" TEXT NOT NULL,
        "artist_name" TEXT NOT NULL,
        "album_title" TEXT NOT NULL,
        "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE ("user_id", "album_mbid")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_wanted_user_id" ON "wanted_items"("user_id")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_wanted_album_mbid" ON "wanted_items"("album_mbid")`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wanted_items"`);
  }
}
