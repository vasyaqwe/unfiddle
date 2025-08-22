CREATE TABLE `estimate` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` integer NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`normalized_name` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`currency` text DEFAULT 'UAH' NOT NULL,
	`selling_price` numeric NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`client` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `estimate_workspace_id_created_at_idx` ON `estimate` (`workspace_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `estimate_workspace_id_name_idx` ON `estimate` (`workspace_id`,`normalized_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `estimate_workspace_id_short_id_unique_idx` ON `estimate` (`workspace_id`,`short_id`);--> statement-breakpoint
CREATE TABLE `estimate_counter` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`last_id` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
