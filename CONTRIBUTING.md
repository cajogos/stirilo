# Contributing to Stirilo

Thanks for your interest in Stirilo. This document covers the local setup and the conventions the project enforces.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm (pinned via the `packageManager` field; enable with `corepack enable`)
- [gitleaks](https://github.com/gitleaks/gitleaks) for local secret scanning (the pre-commit hook uses it; CI enforces it)

## Setup

```bash
pnpm install        # also installs git hooks via lefthook
cp .env.example .env # then fill in values
```

## Common commands

```bash
pnpm lint        # ESLint (flat config, stylistic rules)
pnpm typecheck   # tsc project references
pnpm test        # Vitest
pnpm build       # tsc build
```

## Code style

- **No Prettier.** Style is enforced by ESLint stylistic rules.
- Braces on their own line (Allman style) for TypeScript/JavaScript.
- Semicolons required.
- No em dashes in code, comments, or docs.

## Commits

Commit messages follow Conventional Commits and are checked by `commitlint`:

- Allowed types: `build`, `ci`, `docs`, `feat`, `fix`, `refactor`, `test`. **Never** use `chore`.
- Use a capitalised, specific subject, e.g. `feat: Add scan target listing`.
- Use multi-line bullet points in the body, not prose paragraphs.

## Security

- Never commit secrets or database files. Only `.env.example` (placeholders) is tracked.
- Never read, log, or store the contents of sensitive files; detect by metadata only.
- The pre-commit hook runs gitleaks and ESLint on staged files. Do not bypass it without reason.

See [SECURITY.md](./SECURITY.md) for the full security model.
