# Stirilo

A self-hosted, local-first system control dashboard for developers.

Stirilo runs on your own machine and helps you inspect and understand your local development environment: directory scan targets, filesystem metadata, Git repositories and their status, sensitive-file markers, and basic system health. It surfaces this through a web UI, an authenticated local HTTP API, and a read-only MCP server so AI agents can query system state safely.

> Status: v0.1. Local dashboard, SQLite persistence, directory scanning, Git status, HTTP API, and MCP server.

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

```bash
pnpm install
pnpm setup             # configure username/password and write .env
pnpm dev               # starts the app on http://localhost:3157
```

### Setting up your login

`pnpm setup` is interactive: it prompts for a username and password, stores the password as an argon2id hash, generates a session secret, and writes everything to `.env` (creating it from `.env.example` if needed). Re-run it any time to change the credentials.

If you prefer to edit `.env` by hand, copy `cp .env.example .env` and generate just the password hash for `STIRILO_PASSWORD_HASH` (read from stdin, never passed on the command line):

```bash
read -s -p "Password: " password; echo; printf "%s" "$password" | pnpm hash:password; unset password
```

## Configuration

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
| --- | --- |
| `STIRILO_BIND_HOST` | Bind address (default `127.0.0.1`) |
| `STIRILO_PORT` | Port (default `3157`) |
| `STIRILO_USERNAME` | Login username |
| `STIRILO_PASSWORD_HASH` | argon2id hash of the login password |
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
pnpm db:generate  # generate a Drizzle migration
pnpm db:migrate   # apply migrations
```

## Documentation

- [Architecture](docs/architecture.md)
- [Security model](docs/security-model.md)
- [Filesystem scanner](docs/scanner.md)
- [HTTP API](docs/api.md)
- [MCP server](docs/mcp.md)
- [Command runner (design only)](docs/command-runner.md)
- [Changelog](CHANGELOG.md)

## License

MIT.
