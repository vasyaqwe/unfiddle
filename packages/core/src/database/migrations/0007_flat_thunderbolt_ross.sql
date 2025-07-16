PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_assignee` (
	`creator_id` text NOT NULL,
	`order_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`creator_id`, `order_id`),
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_order_assignee`("creator_id", "order_id", "created_at", "updated_at") SELECT "creator_id", "order_id", "created_at", "updated_at" FROM `order_assignee`;--> statement-breakpoint
DROP TABLE `order_assignee`;--> statement-breakpoint
ALTER TABLE `__new_order_assignee` RENAME TO `order_assignee`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_procurement` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`creator_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`purchase_price` numeric NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text DEFAULT '',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_procurement`("id", "order_id", "creator_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at") SELECT "id", "order_id", "creator_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at" FROM `procurement`;--> statement-breakpoint
DROP TABLE `procurement`;--> statement-breakpoint
ALTER TABLE `__new_procurement` RENAME TO `procurement`;--> statement-breakpoint
CREATE INDEX `procurement_order_id_created_at_idx` ON `procurement` (`order_id`,`created_at`);