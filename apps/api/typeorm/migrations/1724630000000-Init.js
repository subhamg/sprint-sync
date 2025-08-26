"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1724630000000 = void 0;
class Init1724630000000 {
    name = 'Init1724630000000';
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await queryRunner.query(`
      CREATE TYPE "public"."tasks_status_enum" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE')
    `);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "passwordHash" varchar(255) NOT NULL,
        "isAdmin" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(255) NOT NULL,
        "description" text NULL,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "totalMinutes" integer NOT NULL DEFAULT 0,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_ownerId_users_id" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_ownerId_users_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_status_enum"`);
    }
}
exports.Init1724630000000 = Init1724630000000;
//# sourceMappingURL=1724630000000-Init.js.map