DROP INDEX `procurement_buyer_id_idx`;--> statement-breakpoint
ALTER TABLE `procurement` ADD `creator_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `procurement_creator_id_idx` ON `procurement` (`creator_id`);