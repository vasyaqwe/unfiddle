CREATE TABLE `order_message_read` (
	`user_id` text NOT NULL,
	`order_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`last_read_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `order_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_message_read_workspace_id_idx` ON `order_message_read` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `order_message_read_user_id_workspace_id_idx` ON `order_message_read` (`user_id`,`workspace_id`);