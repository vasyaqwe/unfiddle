ALTER TABLE `order` ADD `vat` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `order` ADD `client` text;--> statement-breakpoint
ALTER TABLE `order` ADD `delivers_at` integer;