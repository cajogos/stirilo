import { lstat, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { DEFAULT_IGNORED_DIRECTORIES } from "./ignored.js";
import { detectSensitiveFile } from "./sensitive.js";
import { detectProjectMarker } from "./project.js";

// IMPORTANT: this module reads filesystem METADATA only. It must never read,
// open, or stream the contents of any scanned file. Only readdir + lstat are
// used; a lint rule in eslint.config.mjs forbids fs read APIs in this package.

export interface SensitiveMarker
{
  path: string;
  size: number;
  modifiedAt: string;
  rule: string;
}

export interface FileSizeEntry
{
  path: string;
  size: number;
}

export interface RecentFileEntry
{
  path: string;
  modifiedAt: string;
}

export interface ScanResult
{
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  largestFiles: FileSizeEntry[];
  recentFiles: RecentFileEntry[];
  ignoredDirectories: string[];
  sensitiveMarkers: SensitiveMarker[];
  projectMarkers: string[];
  unreadableCount: number;
  durationMs: number;
}

export interface ScanOptions
{
  ignoredDirectories?: ReadonlySet<string>;
  topN?: number;
}

export async function scanDirectory(
  root: string,
  options: ScanOptions = {},
): Promise<ScanResult>
{
  const ignored = options.ignoredDirectories ?? DEFAULT_IGNORED_DIRECTORIES;
  const topN = options.topN ?? 10;
  const start = Date.now();

  let fileCount = 0;
  let directoryCount = 0;
  let totalSize = 0;
  const ignoredDirectories = new Set<string>();
  const projectMarkers = new Set<string>();
  const sensitiveMarkers: SensitiveMarker[] = [];
  const sizes: FileSizeEntry[] = [];
  const recents: { path: string; mtimeMs: number }[] = [];

  let unreadable = 0;

  async function walk(dir: string): Promise<void>
  {
    let entries;
    try
    {
      entries = await readdir(dir, { withFileTypes: true });
    }
    catch
    {
      // Skip directories we cannot read (e.g. EACCES) rather than aborting.
      unreadable += 1;
      return;
    }

    for (const entry of entries)
    {
      const full = join(dir, entry.name);

      if (entry.isDirectory())
      {
        if (ignored.has(entry.name))
        {
          ignoredDirectories.add(entry.name);
          continue;
        }
        directoryCount += 1;
        await walk(full);
        continue;
      }

      // Files and symlinks: stat the link itself (never follow, never read).
      let stats;
      try
      {
        stats = await lstat(full);
      }
      catch
      {
        unreadable += 1;
        continue;
      }
      fileCount += 1;
      if (entry.isFile())
      {
        totalSize += stats.size;
      }

      const relPath = relative(root, full);

      const marker = detectProjectMarker(entry.name);
      if (marker)
      {
        projectMarkers.add(marker);
      }

      const rule = detectSensitiveFile(entry.name);
      if (rule)
      {
        sensitiveMarkers.push({
          path: relPath,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
          rule,
        });
      }

      sizes.push({ path: relPath, size: stats.size });
      recents.push({ path: relPath, mtimeMs: stats.mtimeMs });
    }
  }

  await walk(root);

  const largestFiles = sizes
    .sort((a, b) => b.size - a.size)
    .slice(0, topN);

  const recentFiles = recents
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, topN)
    .map((entry) => ({
      path: entry.path,
      modifiedAt: new Date(entry.mtimeMs).toISOString(),
    }));

  return {
    fileCount,
    directoryCount,
    totalSize,
    largestFiles,
    recentFiles,
    ignoredDirectories: [...ignoredDirectories].sort(),
    sensitiveMarkers,
    projectMarkers: [...projectMarkers].sort(),
    unreadableCount: unreadable,
    durationMs: Date.now() - start,
  };
}
