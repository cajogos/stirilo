CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_target_id` text,
	`interval_minutes` integer NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_run_at` text,
	`created_at` text NOT NULL
);
