import { lstat, readdir } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { DEFAULT_IGNORED_DIRECTORIES } from "./ignored.js";
import { detectSensitiveFile } from "./sensitive.js";
import { detectProjectMarker } from "./project.js";

// IMPORTANT: this module reads filesystem METADATA only. It must never read,
// open, or stream the contents of any scanned file. Only readdir + lstat are
// used; a lint rule in eslint.config.mjs forbids fs read APIs in this package.
//
// Duplicate detection is therefore metadata-only: candidates are grouped by
// (size + filename), never by hashing contents. Hashing would require opening
// files, which risks reading a secret that name-based detection missed. The
// safety invariant ("choose the path that reads less") overrides the stronger
// content-hash design from the Phase 12 plan.

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

export interface DirSizeEntry
{
  path: string;
  size: number;
  fileCount: number;
}

// An ignored/artifact directory measured for reclaimable space (e.g.
// node_modules, dist). Measured by metadata only; its files are never read.
export interface ArtifactDirEntry
{
  path: string;
  name: string;
  size: number;
}

// A set of non-sensitive files sharing the same size and filename - likely the
// same file copied around. Confidence is heuristic (no content hash).
export interface DuplicateGroup
{
  name: string;
  size: number;
  count: number;
  wastedBytes: number;
  paths: string[];
}

export interface ScanResult
{
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  largestFiles: FileSizeEntry[];
  recentFiles: RecentFileEntry[];
  staleFiles: RecentFileEntry[];
  largestDirectories: DirSizeEntry[];
  artifactDirectories: ArtifactDirEntry[];
  reclaimableBytes: number;
  potentialDuplicates: DuplicateGroup[];
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
  // Measure the size of pruned/ignored directories (reclaimable-space report).
  // Default true; set false to skip the extra walk over artifact dirs.
  measureArtifacts?: boolean;
  // Detect potential duplicates by size + filename. Default true.
  detectDuplicates?: boolean;
  // Called periodically with the running file count, for progress reporting.
  onProgress?: (fileCount: number) => void;
  progressEvery?: number;
}

// Maximum number of duplicate groups to report (largest wasted space first).
const DUPLICATE_GROUP_LIMIT = 50;

// Sum the sizes of all files under a directory using metadata only. Never reads
// file contents; used to size pruned artifact directories.
async function measureDirectorySize(dir: string): Promise<number>
{
  let total = 0;
  let entries;
  try
  {
    entries = await readdir(dir, { withFileTypes: true });
  }
  catch
  {
    return 0;
  }
  for (const entry of entries)
  {
    const full = join(dir, entry.name);
    if (entry.isDirectory())
    {
      total += await measureDirectorySize(full);
      continue;
    }
    try
    {
      const stats = await lstat(full);
      if (entry.isFile())
      {
        total += stats.size;
      }
    }
    catch
    {
      // Unreadable entry: skip.
    }
  }
  return total;
}

export async function scanDirectory(
  root: string,
  options: ScanOptions = {},
): Promise<ScanResult>
{
  const ignored = options.ignoredDirectories ?? DEFAULT_IGNORED_DIRECTORIES;
  const topN = options.topN ?? 10;
  const measureArtifacts = options.measureArtifacts ?? true;
  const detectDuplicates = options.detectDuplicates ?? true;
  const progressEvery = options.progressEvery ?? 1000;
  const start = Date.now();

  let fileCount = 0;
  let directoryCount = 0;
  let totalSize = 0;
  let reclaimableBytes = 0;
  const ignoredDirectories = new Set<string>();
  const projectMarkers = new Set<string>();
  const sensitiveMarkers: SensitiveMarker[] = [];
  const artifactDirectories: ArtifactDirEntry[] = [];
  const sizes: FileSizeEntry[] = [];
  const recents: { path: string; mtimeMs: number }[] = [];
  const dirSizes: DirSizeEntry[] = [];
  // size:basename -> relative paths, non-sensitive files only.
  const dupMap = new Map<string, string[]>();

  let unreadable = 0;

  // Walk a directory, returning the total byte size of its subtree so parent
  // directories can be ranked by aggregate size.
  async function walk(dir: string): Promise<number>
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
      return 0;
    }

    let subtreeSize = 0;

    for (const entry of entries)
    {
      const full = join(dir, entry.name);

      if (entry.isDirectory())
      {
        if (ignored.has(entry.name))
        {
          ignoredDirectories.add(entry.name);
          if (measureArtifacts)
          {
            const size = await measureDirectorySize(full);
            reclaimableBytes += size;
            artifactDirectories.push({
              path: relative(root, full),
              name: entry.name,
              size,
            });
          }
          continue;
        }
        directoryCount += 1;
        subtreeSize += await walk(full);
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
        subtreeSize += stats.size;
      }
      if (options.onProgress && fileCount % progressEvery === 0)
      {
        options.onProgress(fileCount);
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
      else if (detectDuplicates && entry.isFile() && stats.size > 0)
      {
        // Sensitive files are deliberately excluded from duplicate grouping.
        const key = `${stats.size}:${entry.name}`;
        const list = dupMap.get(key);
        if (list)
        {
          list.push(relPath);
        }
        else
        {
          dupMap.set(key, [relPath]);
        }
      }

      sizes.push({ path: relPath, size: stats.size });
      recents.push({ path: relPath, mtimeMs: stats.mtimeMs });
    }

    if (dir !== root)
    {
      dirSizes.push({
        path: relative(root, dir),
        size: subtreeSize,
        fileCount: entries.length,
      });
    }

    return subtreeSize;
  }

  await walk(root);

  const largestFiles = sizes
    .sort((a, b) => b.size - a.size)
    .slice(0, topN);

  const byRecent = [...recents].sort((a, b) => b.mtimeMs - a.mtimeMs);
  const recentFiles = byRecent.slice(0, topN).map((entry) => ({
    path: entry.path,
    modifiedAt: new Date(entry.mtimeMs).toISOString(),
  }));
  const staleFiles = byRecent
    .slice(-topN)
    .reverse()
    .map((entry) => ({
      path: entry.path,
      modifiedAt: new Date(entry.mtimeMs).toISOString(),
    }));

  const largestDirectories = dirSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, topN);

  artifactDirectories.sort((a, b) => b.size - a.size);

  const potentialDuplicates: DuplicateGroup[] = [];
  for (const [key, paths] of dupMap)
  {
    if (paths.length < 2)
    {
      continue;
    }
    const size = Number(key.slice(0, key.indexOf(":")));
    potentialDuplicates.push({
      name: basename(paths[0] ?? ""),
      size,
      count: paths.length,
      wastedBytes: size * (paths.length - 1),
      paths: paths.sort(),
    });
  }
  potentialDuplicates.sort((a, b) => b.wastedBytes - a.wastedBytes);

  return {
    fileCount,
    directoryCount,
    totalSize,
    largestFiles,
    recentFiles,
    staleFiles,
    largestDirectories,
    artifactDirectories,
    reclaimableBytes,
    potentialDuplicates: potentialDuplicates.slice(0, DUPLICATE_GROUP_LIMIT),
    ignoredDirectories: [...ignoredDirectories].sort(),
    sensitiveMarkers,
    projectMarkers: [...projectMarkers].sort(),
    unreadableCount: unreadable,
    durationMs: Date.now() - start,
  };
}
