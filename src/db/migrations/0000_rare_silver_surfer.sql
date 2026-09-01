CREATE TABLE `food_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nutrients` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`unit` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `nutrients_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`source_description` text,
	`bdd_percent` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `food_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`source_version` text DEFAULT '2020' NOT NULL,
	`formula_version` text DEFAULT '1.0.0' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `food_nutrients` (
	`id` text PRIMARY KEY NOT NULL,
	`food_id` text NOT NULL,
	`nutrient_id` text NOT NULL,
	`value_per_100g` real,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_plan_id` text NOT NULL,
	`meal_type` text NOT NULL,
	`food_id` text NOT NULL,
	`weight_grams` real NOT NULL,
	`weight_mode` text DEFAULT 'edible' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nutrition_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_plan_id` text NOT NULL,
	`nutrient_id` text NOT NULL,
	`target_value` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nutrient_id`) REFERENCES `nutrients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `food_sources_name_version_idx` ON `food_sources` (`name`,`version`);
--> statement-breakpoint
CREATE UNIQUE INDEX `foods_source_code_idx` ON `foods` (`source_id`,`code`);
--> statement-breakpoint
CREATE INDEX `foods_code_idx` ON `foods` (`code`);
--> statement-breakpoint
CREATE INDEX `foods_name_idx` ON `foods` (`name`);
--> statement-breakpoint
CREATE UNIQUE INDEX `food_nutrients_food_nutrient_idx` ON `food_nutrients` (`food_id`,`nutrient_id`);
--> statement-breakpoint
CREATE INDEX `food_nutrients_food_id_idx` ON `food_nutrients` (`food_id`);
--> statement-breakpoint
CREATE INDEX `food_nutrients_nutrient_id_idx` ON `food_nutrients` (`nutrient_id`);
--> statement-breakpoint
CREATE INDEX `meal_entries_meal_plan_id_idx` ON `meal_entries` (`meal_plan_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `nutrition_targets_plan_nutrient_idx` ON `nutrition_targets` (`meal_plan_id`,`nutrient_id`);
--> statement-breakpoint
CREATE INDEX `nutrition_targets_meal_plan_id_idx` ON `nutrition_targets` (`meal_plan_id`);
