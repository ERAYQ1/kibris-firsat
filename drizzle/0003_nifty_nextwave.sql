CREATE TABLE `price_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`deal_id` integer NOT NULL,
	`target_price_cents` integer NOT NULL,
	`is_triggered` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chk_target_price_positive" CHECK("price_alerts"."target_price_cents" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_price_alerts_user` ON `price_alerts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_price_alerts_deal` ON `price_alerts` (`deal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_price_alert_user_deal` ON `price_alerts` (`user_id`,`deal_id`);--> statement-breakpoint
ALTER TABLE `deals` ADD `coupon_code` text(50);--> statement-breakpoint
ALTER TABLE `deals` ADD `coupon_discount` text(50);--> statement-breakpoint
ALTER TABLE `stores` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `stores` ADD `longitude` real;