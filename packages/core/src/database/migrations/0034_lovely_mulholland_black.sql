CREATE TABLE `order_item_assignee` (
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`creator_id`, `order_item_id`),
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON UPDATE no action ON DELETE cascade
);
