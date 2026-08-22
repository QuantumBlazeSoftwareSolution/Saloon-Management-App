ALTER TABLE "saloons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "saloons" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_saloon_id_saloons_id_fk";
--> statement-breakpoint
ALTER TABLE "service_logs" DROP CONSTRAINT "service_logs_saloon_id_saloons_id_fk";
--> statement-breakpoint
ALTER TABLE "services_catalog" DROP CONSTRAINT "services_catalog_saloon_id_saloons_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "saloon_id";--> statement-breakpoint
ALTER TABLE "service_logs" DROP COLUMN "saloon_id";--> statement-breakpoint
ALTER TABLE "services_catalog" DROP COLUMN "saloon_id";