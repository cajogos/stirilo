# Phase 0: Repository Foundation

**Status:** Not started
**Depends on:** nothing
**PRD reference:** Milestone 0, Implementation Order step 1

## Goal

Stand up an installable, lintable, testable pnpm monorepo that is safe to publish publicly, before any feature code exists.

## In scope

- pnpm workspace (`pnpm-workspace.yaml`, root `package.json`)
- Shared TypeScript config (root `tsconfig.json` + per-package extends)
- ESLint **flat config** (`eslint.config.js`) with stylistic rules enforcing Allman braces + semicolons (**no Prettier**, see CLAUDE.md)
- TypeScript **strict mode** + monorepo **project references**
- Toolchain pinning: `.nvmrc` (Node 22), `packageManager` field (corepack-pinned pnpm), `engines` in root `package.json`
- GitHub Actions CI workflow
- gitleaks config + CI step **and** a pre-commit hook (lefthook or husky), plus `commitlint` to enforce commit-type rules
- Root `.gitignore` (must cover `.env*`, `*.db`, `*.db-*`, `*.sqlite`, `*.sqlite3`, `*.pem`, `*.key`, `data/*` except `.gitkeep`, build output)
- `.env.example` with placeholder values only
- `LICENSE` (**MIT**), `SECURITY.md`, `CONTRIBUTING.md`
- Empty `packages/*` and `apps/web/` skeletons (directory + `package.json` only, no feature code)
- `data/.gitkeep`

## Out of scope

- Any application/feature code
- Next.js app implementation (Phase 1)
- Database schema (Phase 2)

## Deliverables

- [ ] `pnpm-workspace.yaml` + root `package.json` with workspace scripts
- [ ] Root + package `tsconfig.json` (strict mode + project references)
- [ ] ESLint flat config with `@stylistic` rules (Allman braces, semicolons)
- [ ] Toolchain pinning: `.nvmrc`, `packageManager`, `engines`
- [ ] `.gitignore` (root) covering all secret/db/generated artefacts
- [ ] `.env.example` (placeholders only)
- [ ] `LICENSE` (MIT)
- [ ] `SECURITY.md`, `CONTRIBUTING.md`
- [ ] GitHub Actions workflow running install/lint/typecheck/test/build/gitleaks
- [ ] gitleaks configuration + pre-commit hook (lefthook/husky)
- [ ] `commitlint` enforcing commit-type rules

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
- License is **MIT**.
