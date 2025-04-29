PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_verification`("id", "identifier", "value", "expires_at", "created_at", "updated_at") SELECT "id", "identifier", "value", "expires_at", "created_at", "updated_at" FROM `verification`;--> statement-breakpoint
DROP TABLE `verification`;--> statement-breakpoint
ALTER TABLE `__new_verification` RENAME TO `verification`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`invite_code` text NOT NULL,
	`creator_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workspace`("id", "name", "image", "invite_code", "creator_id", "created_at", "updated_at") SELECT "id", "name", "image", "invite_code", "creator_id", "created_at", "updated_at" FROM `workspace`;--> statement-breakpoint
DROP TABLE `workspace`;--> statement-breakpoint
ALTER TABLE `__new_workspace` RENAME TO `workspace`;--> statement-breakpoint
CREATE INDEX `workspace_invite_code_index` ON `workspace` (`invite_code`);--> statement-breakpoint
CREATE TABLE `__new_workspace_member` (
	`creator_id` text NOT NULL,
	`role` text NOT NULL,
	`workspace_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`creator_id`, `workspace_id`),
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workspace_member`("creator_id", "role", "workspace_id", "created_at", "updated_at") SELECT "creator_id", "role", "workspace_id", "created_at", "updated_at" FROM `workspace_member`;--> statement-breakpoint
DROP TABLE `workspace_member`;--> statement-breakpoint
ALTER TABLE `__new_workspace_member` RENAME TO `workspace_member`;