PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` integer NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`good_id` text,
	`group_id` text,
	`normalized_name` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`selling_price` numeric NOT NULL,
	`desired_price` numeric,
	`severity` text DEFAULT 'low' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`good_id`) REFERENCES `good`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_order`("id", "short_id", "creator_id", "workspace_id", "good_id", "group_id", "normalized_name", "name", "quantity", "selling_price", "desired_price", "severity", "note", "status", "deleted_at", "created_at", "updated_at") SELECT "id", "short_id", "creator_id", "workspace_id", "good_id", "group_id", "normalized_name", "name", "quantity", "selling_price", "desired_price", "severity", "note", "status", "deleted_at", "created_at", "updated_at" FROM `order`;--> statement-breakpoint
DROP TABLE `order`;--> statement-breakpoint
ALTER TABLE `__new_order` RENAME TO `order`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `order_workspace_id_deleted_at_created_at_idx` ON `order` (`workspace_id`,`deleted_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_workspace_id_name_idx` ON `order` (`workspace_id`,`normalized_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_workspace_id_short_id_unique_idx` ON `order` (`workspace_id`,`short_id`);