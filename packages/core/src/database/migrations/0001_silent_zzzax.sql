DROP INDEX `order_short_id_idx`;--> statement-breakpoint
DROP INDEX `order_name_idx`;--> statement-breakpoint
DROP INDEX `order_status_idx`;--> statement-breakpoint
DROP INDEX `order_creator_id_idx`;--> statement-breakpoint
ALTER TABLE `order` ADD `good_id` text REFERENCES good(id);--> statement-breakpoint
CREATE INDEX `order_workspace_id_deleted_at_created_at_idx` ON `order` (`workspace_id`,`deleted_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_workspace_id_name_idx` ON `order` (`workspace_id`,`normalized_name`);--> statement-breakpoint
DROP INDEX `procurement_creator_id_idx`;--> statement-breakpoint
CREATE INDEX `procurement_order_id_created_at_idx` ON `procurement` (`order_id`,`created_at`);