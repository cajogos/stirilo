CREATE TABLE `health_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`total_memory` integer DEFAULT 0 NOT NULL,
	`free_memory` integer DEFAULT 0 NOT NULL,
	`load_avg_1` real DEFAULT 0 NOT NULL,
	`disk_total` integer DEFAULT 0 NOT NULL,
	`disk_free` integer DEFAULT 0 NOT NULL,
	`uptime_seconds` integer DEFAULT 0 NOT NULL
);
