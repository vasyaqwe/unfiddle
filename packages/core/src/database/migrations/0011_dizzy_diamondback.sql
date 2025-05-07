PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` integer NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name_lower` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`selling_price` integer,
	`severity` text DEFAULT 'low' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_order`("id", "short_id", "creator_id", "workspace_id", "name_lower", "name", "quantity", "selling_price", "severity", "note", "status", "deleted_at", "created_at", "updated_at") SELECT "id", "short_id", "creator_id", "workspace_id", "name_lower", "name", "quantity", "selling_price", "severity", "note", "status", "deleted_at", "created_at", "updated_at" FROM `order`;--> statement-breakpoint
DROP TABLE `order`;--> statement-breakpoint
ALTER TABLE `__new_order` RENAME TO `order`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `order_short_id_idx` ON `order` (`short_id`);--> statement-breakpoint
CREATE INDEX `order_name_idx` ON `order` (`name_lower`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `order` (`status`);--> statement-breakpoint
CREATE INDEX `order_creator_id_idx` ON `order` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_workspace_id_short_id_unique_idx` ON `order` (`workspace_id`,`short_id`);