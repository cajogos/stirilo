# Stirilo

A self-hosted, local-first system control dashboard for developers.

Stirilo runs on your own machine and helps you inspect and understand your local development environment: directory scan targets, filesystem metadata, Git repositories and their status, sensitive-file markers, and basic system health. It surfaces this through a web UI and an authenticated local HTTP API, with an MCP server planned so AI agents can query system state safely.

> Status: early development (pre-v0.1). Things will change.

## Principles

- **Local-first.** Binds to `127.0.0.1` by default. LAN access is opt-in only.
- **Secrets-safe by design.** Stirilo detects sensitive files (`.env`, private keys, etc.) by metadata only. It never reads, displays, logs, or stores their contents.
- **Read-only first.** v0.1 observes and reports. It does not run arbitrary commands, edit files, manage the system, or run as root.

## What it will not do (v0.1)

- Read secret file contents (`.env`, SSH keys, etc.)
- Execute arbitrary shell commands or run sudo
- Edit files from the UI
- Run as root or bind to the LAN by default
- Manage users, firewalls, disks, or packages

## Tech stack

pnpm workspace, Node.js 22+, TypeScript, Next.js, Tailwind CSS, shadcn/ui, SQLite (Drizzle ORM), Zod. Tested with Vitest and Playwright.

## Getting started

> Not all of this is wired up yet; see the project status above.

```bash
pnpm install
cp .env.example .env   # then fill in the values below
pnpm dev               # starts the app on http://localhost:3157
```

### Generating a password hash

v0.1 uses a single local user. Generate the SHA-256 hash for `STIRILO_PASSWORD_SHA256`:

```bash
read -s -p "Password: " password; echo; printf "%s" "$password" | sha256sum | awk '{print $1}'; unset password
```

## Configuration

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
| --- | --- |
| `STIRILO_BIND_HOST` | Bind address (default `127.0.0.1`) |
| `STIRILO_PORT` | Port (default `3157`) |
| `STIRILO_USERNAME` | Login username |
| `STIRILO_PASSWORD_SHA256` | SHA-256 of the login password |
| `STIRILO_SESSION_SECRET` | Session signing secret |
| `STIRILO_DB_PATH` | SQLite path (default `./data/stirilo.dev.db`) |
| `STIRILO_AGENT_TOKEN` | Token for the HTTP API |

Never commit `.env` or database files.

## Development

```bash
pnpm dev          # run the app
pnpm build        # production build
pnpm lint         # lint
pnpm typecheck    # type check
pnpm test         # unit/integration tests (Vitest)
pnpm test:e2e     # end-to-end tests (Playwright)
pnpm gitleaks     # scan for committed secrets
```

## License

TBD.
