CREATE TABLE `scan_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_target_id` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`summary_json` text,
	`error_message` text,
	FOREIGN KEY (`scan_target_id`) REFERENCES `scan_targets`(`id`) ON UPDATE no action ON DELETE no action
);
