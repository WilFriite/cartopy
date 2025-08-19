CREATE TABLE `lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`items` text DEFAULT '',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_performed_at` text DEFAULT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lists_name_unique` ON `lists` (`name`);