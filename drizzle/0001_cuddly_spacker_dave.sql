ALTER TYPE "public"."role_enum" ADD VALUE 'admin';--> statement-breakpoint
CREATE TABLE "saloons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "saloon_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "saloon_id" uuid;--> statement-breakpoint
ALTER TABLE "service_logs" ADD COLUMN "saloon_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "services_catalog" ADD COLUMN "saloon_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_catalog" ADD CONSTRAINT "services_catalog_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_saloon_id_idx" ON "appointments" USING btree ("saloon_id");--> statement-breakpoint
CREATE INDEX "profiles_saloon_id_idx" ON "profiles" USING btree ("saloon_id");--> statement-breakpoint
CREATE INDEX "service_logs_saloon_id_idx" ON "service_logs" USING btree ("saloon_id");--> statement-breakpoint
CREATE INDEX "services_catalog_saloon_id_idx" ON "services_catalog" USING btree ("saloon_id");