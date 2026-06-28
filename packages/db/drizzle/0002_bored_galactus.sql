CREATE TABLE `scan_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_scan_at` text,
	`last_scan_status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scan_targets_path_unique` ON `scan_targets` (`path`);