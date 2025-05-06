CREATE TABLE `order_counter` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`last_id` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
