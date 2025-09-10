PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`items` text DEFAULT '',
	`created_at` text NOT NULL,
	`last_performed_at` text DEFAULT NULL
);
--> statement-breakpoint
INSERT INTO `__new_lists`("id", "name", "items", "created_at", "last_performed_at") SELECT "id", "name", "items", "created_at", "last_performed_at" FROM `lists`;--> statement-breakpoint
DROP TABLE `lists`;--> statement-breakpoint
ALTER TABLE `__new_lists` RENAME TO `lists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `lists_name_unique` ON `lists` (`name`);