// Directories that are skipped entirely (pruned, not descended) during a scan.
export const DEFAULT_IGNORED_DIRECTORIES: ReadonlySet<string> = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  "vendor",
  "target",
  "__pycache__",
]);
