import { accessSync, constants, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, resolve, sep } from "node:path";

export type PathCategory = "allowed" | "requires-confirmation" | "blocked";

export interface PathValidationOk
{
  ok: true;
  canonicalPath: string;
  category: PathCategory;
}

export interface PathValidationError
{
  ok: false;
  reason: string;
  category?: PathCategory;
  requiresConfirmation?: boolean;
}

export type PathValidationResult = PathValidationOk | PathValidationError;

// Hard-blocked locations. "/" is matched by exact equality only; the rest match
// the path itself or anything beneath it.
const BLOCKED_UNDER = ["~/.ssh", "~/.gnupg", "/proc", "/sys", "/dev", "/run", "/tmp"];
// Sensitive but permitted with explicit confirmation.
const CONFIRM_UNDER = ["/etc", "/var/log", "/srv", "/opt", "/home"];

export function expandTilde(input: string): string
{
  if (input === "~")
  {
    return homedir();
  }
  if (input.startsWith("~/") || input.startsWith(`~${sep}`))
  {
    return resolve(homedir(), input.slice(2));
  }
  return input;
}

// True when `target` is the base directory itself or nested beneath it. Compared
// segment-wise so "/home" does not match "/home-backups".
function isWithin(target: string, base: string): boolean
{
  if (target === base)
  {
    return true;
  }
  const prefix = base.endsWith(sep) ? base : base + sep;
  return target.startsWith(prefix);
}

// Categorise an absolute, canonical path against the block/confirm lists.
export function categorizePath(canonicalPath: string): PathCategory
{
  if (canonicalPath === sep)
  {
    return "blocked";
  }
  for (const base of BLOCKED_UNDER)
  {
    if (isWithin(canonicalPath, expandTilde(base)))
    {
      return "blocked";
    }
  }
  for (const base of CONFIRM_UNDER)
  {
    if (isWithin(canonicalPath, expandTilde(base)))
    {
      return "requires-confirmation";
    }
  }
  return "allowed";
}

// Validate a user-supplied scan target path. Canonicalises (resolving symlinks
// and "..") BEFORE applying the blocklist, so neither symlinks nor traversal can
// slip a blocked location past the check.
export function validateScanTargetPath(
  input: string,
  options: { confirm?: boolean } = {},
): PathValidationResult
{
  const trimmed = input.trim();
  if (!trimmed)
  {
    return { ok: false, reason: "Path is required." };
  }

  const expanded = expandTilde(trimmed);
  const absolute = isAbsolute(expanded) ? expanded : resolve(expanded);

  let canonicalPath: string;
  try
  {
    canonicalPath = realpathSync(absolute);
  }
  catch
  {
    return { ok: false, reason: "Path does not exist." };
  }

  let stats;
  try
  {
    stats = statSync(canonicalPath);
  }
  catch
  {
    return { ok: false, reason: "Path could not be read." };
  }

  if (!stats.isDirectory())
  {
    return { ok: false, reason: "Path is not a directory." };
  }

  try
  {
    accessSync(canonicalPath, constants.R_OK);
  }
  catch
  {
    return { ok: false, reason: "Path is not readable." };
  }

  const category = categorizePath(canonicalPath);
  if (category !== "allowed" && !options.confirm)
  {
    return {
      ok: false,
      category,
      requiresConfirmation: true,
      reason:
        category === "blocked"
          ? "This path is blocked by default. Confirm to add it anyway."
          : "This path is sensitive. Confirm to add it.",
    };
  }

  return { ok: true, canonicalPath, category };
}
