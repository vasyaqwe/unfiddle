CREATE TABLE `estimate_message` (
	`id` text PRIMARY KEY NOT NULL,
	`estimate_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`creator_id` text NOT NULL,
	`reply_to_id` text,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`estimate_id`) REFERENCES `estimate`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_to_id`) REFERENCES `estimate_message`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `estimate_message_estimate_id_created_at_idx` ON `estimate_message` (`estimate_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `estimate_message_workspace_id_created_at_idx` ON `estimate_message` (`workspace_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `estimate_message_read` (
	`user_id` text NOT NULL,
	`estimate_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`last_read_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `estimate_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`estimate_id`) REFERENCES `estimate`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `estimate_message_read_workspace_id_idx` ON `estimate_message_read` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `estimate_message_read_user_id_workspace_id_idx` ON `estimate_message_read` (`user_id`,`workspace_id`);