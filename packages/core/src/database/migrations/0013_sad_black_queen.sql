PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` integer NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name_lower` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`selling_price` numeric NOT NULL,
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
CREATE UNIQUE INDEX `order_workspace_id_short_id_unique_idx` ON `order` (`workspace_id`,`short_id`);--> statement-breakpoint
CREATE TABLE `__new_procurement` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`purchase_price` numeric NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text DEFAULT '',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buyer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_procurement`("id", "order_id", "buyer_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at") SELECT "id", "order_id", "buyer_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at" FROM `procurement`;--> statement-breakpoint
DROP TABLE `procurement`;--> statement-breakpoint
ALTER TABLE `__new_procurement` RENAME TO `procurement`;--> statement-breakpoint
CREATE INDEX `procurement_buyer_id_idx` ON `procurement` (`buyer_id`);