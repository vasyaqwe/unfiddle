CREATE TABLE `order_assignee` (
	`creator_id` text NOT NULL,
	`order_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`creator_id`, `order_id`),
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade
);
