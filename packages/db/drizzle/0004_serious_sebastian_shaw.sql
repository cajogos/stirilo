CREATE TABLE `git_repositories` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_target_id` text,
	`path` text NOT NULL,
	`sanitized_remote_url` text,
	`remote_host` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `git_repositories_path_unique` ON `git_repositories` (`path`);--> statement-breakpoint
CREATE TABLE `git_status_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`git_repository_id` text NOT NULL,
	`branch` text,
	`is_dirty` integer DEFAULT false NOT NULL,
	`staged_count` integer DEFAULT 0 NOT NULL,
	`unstaged_count` integer DEFAULT 0 NOT NULL,
	`untracked_count` integer DEFAULT 0 NOT NULL,
	`ahead_count` integer DEFAULT 0 NOT NULL,
	`behind_count` integer DEFAULT 0 NOT NULL,
	`last_commit_hash` text,
	`last_commit_subject` text,
	`last_commit_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`git_repository_id`) REFERENCES `git_repositories`(`id`) ON UPDATE no action ON DELETE no action
);
