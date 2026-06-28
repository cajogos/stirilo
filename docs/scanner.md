# Filesystem Scanner

`@stirilo/scanner` produces a metadata-only summary of a directory. It never
reads file contents.

## What it collects

- File count, directory count, total size
- Top-N largest files and most recently modified files (paths + sizes/times)
- Ignored directories encountered (pruned, not descended)
- Sensitive file markers (path, size, modified time, detection rule)
- Project markers (lockfiles, configs, Dockerfiles, etc.)
- Count of unreadable entries (skipped on permission errors)
- Scan duration

## How it works

- Traversal uses `readdir` (with file types) and `lstat` only. No `readFile`,
  `open`, or streams are ever used.
- Symlinks are stat'd as links and never followed, preventing loops and escapes
  out of the tree.
- Ignored directories are pruned during traversal (not descended then
  discarded), which is both correct and fast.
- Unreadable directories/files (e.g. `EACCES`) are skipped and counted rather
  than aborting the whole scan.
- Output lists are bounded to top-N.

## Default ignored directories

`node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, `.cache`,
`vendor`, `target`, `__pycache__`.

## Sensitive file detection (by name only)

| Pattern | Rule |
| --- | --- |
| `.env`, `.env.*` | `env-file` |
| `id_rsa`, `id_ed25519` | `ssh-private-key` |
| `*.pem`, `*.key`, `*.p12`, `*.pfx` | `key-or-certificate` |
| `*.kdbx` | `password-database` |
| `*.sqlite`, `*.sqlite3`, `*.db` | `database-file` |

Only metadata is stored. The contents of these files are never read. The scan
summary is passed through redaction before being persisted.
