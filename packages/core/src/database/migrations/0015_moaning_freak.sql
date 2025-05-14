PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_procurement`("id", "order_id", "creator_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at") SELECT "id", "order_id", "creator_id", "quantity", "purchase_price", "status", "note", "created_at", "updated_at" FROM `procurement`;--> statement-breakpoint
DROP TABLE `procurement`;--> statement-breakpoint
ALTER TABLE `__new_procurement` RENAME TO `procurement`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `procurement_creator_id_idx` ON `procurement` (`creator_id`);