CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`selling_price` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_creator_id_idx` ON `order` (`creator_id`);--> statement-breakpoint
CREATE TABLE `procurement` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`purchase_price` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text DEFAULT '',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buyer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `procurement_buyer_id_idx` ON `procurement` (`buyer_id`);