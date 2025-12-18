ALTER TABLE `estimate` ADD `client_id` text REFERENCES client(id);--> statement-breakpoint
ALTER TABLE `order` DROP COLUMN `client`;