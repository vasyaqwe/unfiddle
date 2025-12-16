CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text DEFAULT '' NOT NULL,
	`severity` text DEFAULT 'low' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `client_workspace_id_created_at_idx` ON `client` (`workspace_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `client_workspace_id_name_idx` ON `client` (`workspace_id`,`normalized_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_workspace_id_name_unique_idx` ON `client` (`workspace_id`,`normalized_name`);