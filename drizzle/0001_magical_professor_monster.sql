CREATE TYPE "public"."role_enum" AS ENUM('owner', 'barber');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role_enum" USING "role"::"public"."role_enum";