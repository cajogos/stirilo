# Security Policy

Stirilo is a local-first tool that inspects a developer's own machine. Security and privacy are core product requirements, not afterthoughts.

## Design guarantees

- **Local-first.** Binds to `127.0.0.1` by default. LAN access is opt-in via explicit configuration only.
- **Secrets-safe by design.** Stirilo detects sensitive files (`.env`, private keys, etc.) by metadata only (path, size, modified time, detection rule). It never reads, displays, logs, or stores their contents.
- **No secrets in the repo.** `.env`, database files, keys, and certificates are gitignored. Only `.env.example` (placeholders) is committed. CI runs `gitleaks`, and a pre-commit hook scans staged changes.
- **Read-only first.** v0.1 observes and reports. It does not execute arbitrary commands, edit files, manage the system, or run as root.
- **Least privilege.** The application must never run as root and must not require sudo for any v0.1 feature.

## Reporting a vulnerability

If you discover a security issue, please report it privately rather than opening a public issue:

- Open a [GitHub security advisory](https://github.com/cajogos/stirilo/security/advisories/new), or
- Contact the maintainer directly via the email on the GitHub profile.

Please include reproduction steps and the affected version or commit. We aim to acknowledge reports within a few days.

## Scope

In scope: the Stirilo application, its packages, and its HTTP API/MCP surface. Out of scope: third-party dependencies (report upstream) and issues that require an already-compromised local machine.
