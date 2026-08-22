ALTER TABLE "appointments" RENAME COLUMN "service_id" TO "service_ids";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_service_id_services_catalog_id_fk";
