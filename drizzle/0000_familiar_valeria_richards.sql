CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saloon_id" uuid,
	"role" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"commission_pct" integer DEFAULT 50 NOT NULL,
	"pin" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saloons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"commission_default_pct" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saloon_id" uuid,
	"barber_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"price_at_time" real NOT NULL,
	"discount_pct" real DEFAULT 0 NOT NULL,
	"commission_pct" real NOT NULL,
	"commission_amount" real NOT NULL,
	"net_amount" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saloon_id" uuid,
	"name" text NOT NULL,
	"base_price" real NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_barber_id_profiles_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_service_id_services_catalog_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_catalog" ADD CONSTRAINT "services_catalog_saloon_id_saloons_id_fk" FOREIGN KEY ("saloon_id") REFERENCES "public"."saloons"("id") ON DELETE cascade ON UPDATE no action;