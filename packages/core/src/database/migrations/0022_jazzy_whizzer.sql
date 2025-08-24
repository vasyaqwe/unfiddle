CREATE TABLE `estimate_item` (
	`id` text PRIMARY KEY NOT NULL,
	`estimate_id` text NOT NULL,
	`workspace_id` text,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`desired_price` numeric,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`estimate_id`) REFERENCES `estimate`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `estimate_item_estimate_id_idx` ON `estimate_item` (`estimate_id`);