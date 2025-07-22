CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`name` text NOT NULL,
	`width` integer,
	`height` integer,
	`subject_id` text NOT NULL,
	`subject_type` text NOT NULL,
	`creator_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attachment_subject_id_index` ON `attachment` (`subject_id`);--> statement-breakpoint
CREATE INDEX `attachment_subject_type_index` ON `attachment` (`subject_type`);