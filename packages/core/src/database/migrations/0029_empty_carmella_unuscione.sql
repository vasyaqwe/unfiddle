CREATE TABLE `order_message` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`creator_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_message_order_id_created_at_idx` ON `order_message` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_message_workspace_id_created_at_idx` ON `order_message` (`workspace_id`,`created_at`);