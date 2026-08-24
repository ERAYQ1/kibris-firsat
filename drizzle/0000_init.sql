CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text(60) NOT NULL,
	`name` text(80) NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `deal_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`filename` text(80) NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_deal_images_deal` ON `deal_images` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `deal_images_filename_unique` ON `deal_images` (`filename`);--> statement-breakpoint
CREATE TABLE `deals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer NOT NULL,
	`title` text(120) NOT NULL,
	`description` text(2000),
	`price_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`category_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`store_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "chk_price_positive" CHECK("deals"."price_cents" > 0),
	CONSTRAINT "chk_status_valid" CHECK("deals"."status" IN ('active','expired','reported','removed'))
);
--> statement-breakpoint
CREATE INDEX `idx_deals_status_created` ON `deals` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_deals_category` ON `deals` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_location` ON `deals` (`location_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_store` ON `deals` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_author` ON `deals` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_expires` ON `deals` (`expires_at`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text(60) NOT NULL,
	`name` text(80) NOT NULL,
	`parent_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_slug_unique` ON `locations` (`slug`);--> statement-breakpoint
CREATE TABLE `price_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`recorded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_price_entries_deal` ON `price_entries` (`deal_id`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`reason` text NOT NULL,
	`details` text(500),
	`status` text DEFAULT 'open' NOT NULL,
	`resolved_by` integer,
	`resolved_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_reports_status` ON `reports` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_reports_deal` ON `reports` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_report_user_deal` ON `reports` (`user_id`,`deal_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text(64) NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_tokenHash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(80) NOT NULL,
	`normalized_name` text(80) NOT NULL,
	`location_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_stores_location` ON `stores` (`location_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_store_per_location` ON `stores` (`normalized_name`,`location_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text(254) NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text(40) NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chk_vote_value" CHECK("votes"."value" IN (-1, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_votes_deal` ON `votes` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_vote_user_deal` ON `votes` (`user_id`,`deal_id`);