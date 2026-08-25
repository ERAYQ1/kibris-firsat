CREATE TABLE `deal_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deal_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_verifications_deal` ON `deal_verifications` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_verification_user_deal` ON `deal_verifications` (`user_id`,`deal_id`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`deal_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_favorites_user` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_favorites_deal` ON `favorites` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_favorite_user_deal` ON `favorites` (`user_id`,`deal_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text(120) NOT NULL,
	`message` text(500) NOT NULL,
	`link` text(200),
	`is_read` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_deals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer NOT NULL,
	`title` text(120) NOT NULL,
	`description` text(2000),
	`price_cents` integer NOT NULL,
	`original_price_cents` integer,
	`currency` text NOT NULL,
	`category_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`store_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`tags` text(200),
	`contact_info` text(100),
	`is_verified` integer DEFAULT 0 NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "chk_price_positive" CHECK("__new_deals"."price_cents" > 0),
	CONSTRAINT "chk_status_valid" CHECK("__new_deals"."status" IN ('active','expired','sold_out','hidden','rejected','reported','removed'))
);
--> statement-breakpoint
INSERT INTO `__new_deals`("id", "author_id", "title", "description", "price_cents", "original_price_cents", "currency", "category_id", "location_id", "store_id", "status", "view_count", "tags", "contact_info", "is_verified", "expires_at", "created_at", "updated_at") SELECT "id", "author_id", "title", "description", "price_cents", "original_price_cents", "currency", "category_id", "location_id", "store_id", "status", 0, NULL, NULL, 0, "expires_at", "created_at", "updated_at" FROM `deals`;--> statement-breakpoint
DROP TABLE `deals`;--> statement-breakpoint
ALTER TABLE `__new_deals` RENAME TO `deals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_deals_status_created` ON `deals` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_deals_category` ON `deals` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_location` ON `deals` (`location_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_store` ON `deals` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_author` ON `deals` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_deals_expires` ON `deals` (`expires_at`);--> statement-breakpoint
ALTER TABLE `stores` ADD `phone` text(30);--> statement-breakpoint
ALTER TABLE `stores` ADD `address` text(200);--> statement-breakpoint
ALTER TABLE `stores` ADD `is_verified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text(120);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text(300);--> statement-breakpoint
ALTER TABLE `users` ADD `is_banned` integer DEFAULT 0 NOT NULL;