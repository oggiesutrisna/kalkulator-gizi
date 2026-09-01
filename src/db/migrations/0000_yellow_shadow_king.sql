CREATE TABLE "food_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"version" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"source_description" text,
	"bdd_percent" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"unit" varchar(20) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutrients_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "food_nutrients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_id" uuid NOT NULL,
	"nutrient_id" uuid NOT NULL,
	"value_per_100g" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"source_version" varchar(50) DEFAULT '2020' NOT NULL,
	"formula_version" varchar(50) DEFAULT '1.0.0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"meal_type" varchar(50) NOT NULL,
	"food_id" uuid NOT NULL,
	"weight_grams" double precision NOT NULL,
	"weight_mode" varchar(20) DEFAULT 'edible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"nutrient_id" uuid NOT NULL,
	"target_value" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_source_id_food_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."food_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_targets" ADD CONSTRAINT "nutrition_targets_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_targets" ADD CONSTRAINT "nutrition_targets_nutrient_id_nutrients_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "food_sources_name_version_idx" ON "food_sources" USING btree ("name","version");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_source_code_idx" ON "foods" USING btree ("source_id","code");--> statement-breakpoint
CREATE INDEX "foods_code_idx" ON "foods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "foods_name_idx" ON "foods" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "food_nutrients_food_nutrient_idx" ON "food_nutrients" USING btree ("food_id","nutrient_id");--> statement-breakpoint
CREATE INDEX "food_nutrients_food_id_idx" ON "food_nutrients" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "food_nutrients_nutrient_id_idx" ON "food_nutrients" USING btree ("nutrient_id");--> statement-breakpoint
CREATE INDEX "meal_entries_meal_plan_id_idx" ON "meal_entries" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nutrition_targets_plan_nutrient_idx" ON "nutrition_targets" USING btree ("meal_plan_id","nutrient_id");--> statement-breakpoint
CREATE INDEX "nutrition_targets_meal_plan_id_idx" ON "nutrition_targets" USING btree ("meal_plan_id");