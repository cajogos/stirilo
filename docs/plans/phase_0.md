# Phase 0: Repository Foundation

**Status:** Not started
**Depends on:** nothing
**PRD reference:** Milestone 0, Implementation Order step 1

## Goal

Stand up an installable, lintable, testable pnpm monorepo that is safe to publish publicly, before any feature code exists.

## In scope

- pnpm workspace (`pnpm-workspace.yaml`, root `package.json`)
- Shared TypeScript config (root `tsconfig.json` + per-package extends)
- ESLint with stylistic rules enforcing Allman braces + semicolons (**no Prettier**, see CLAUDE.md)
- GitHub Actions CI workflow
- gitleaks config + CI step
- Root `.gitignore` (must cover `.env*`, `*.db`, `*.db-*`, `*.sqlite`, `*.sqlite3`, `*.pem`, `*.key`, `data/*` except `.gitkeep`, build output)
- `.env.example` with placeholder values only
- `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`
- Empty `packages/*` and `apps/web/` skeletons (directory + `package.json` only, no feature code)
- `data/.gitkeep`

## Out of scope

- Any application/feature code
- Next.js app implementation (Phase 1)
- Database schema (Phase 2)

## Deliverables

- [ ] `pnpm-workspace.yaml` + root `package.json` with workspace scripts
- [ ] Root + package `tsconfig.json`
- [ ] ESLint config with `@stylistic` rules (Allman braces, semicolons)
- [ ] `.gitignore` (root) covering all secret/db/generated artefacts
- [ ] `.env.example` (placeholders only)
- [ ] `LICENSE` (license choice still TBD, confirm with Carlos)
- [ ] `SECURITY.md`, `CONTRIBUTING.md`
- [ ] GitHub Actions workflow running install/lint/typecheck/test/build/gitleaks
- [ ] gitleaks configuration

## Acceptance criteria

- [ ] `pnpm install` works
- [ ] `pnpm lint` works
- [ ] `pnpm typecheck` works
- [ ] `pnpm test` works (even with zero/placeholder tests)
- [ ] CI passes
- [ ] No local secrets committed (verify with gitleaks + manual `git diff --staged`)

## Safety notes

- Root `.gitignore` must exist before any secret-bearing or generated file is introduced.
- `.env.example` carries placeholders only, never real values.
- Confirm license choice with Carlos before committing `LICENSE`.
