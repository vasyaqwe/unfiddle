CREATE TABLE `estimate_procurement` (
	`id` text PRIMARY KEY NOT NULL,
	`estimate_id` text NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`estimate_item_id` text,
	`quantity` integer NOT NULL,
	`purchase_price` numeric NOT NULL,
	`note` text DEFAULT '',
	`provider` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`estimate_id`) REFERENCES `estimate`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`estimate_item_id`) REFERENCES `estimate_item`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `estimate_procurement_estimate_id_created_at_idx` ON `estimate_procurement` (`estimate_id`,`created_at`);