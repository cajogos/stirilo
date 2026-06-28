# Phase 0: Repository Foundation

**Status:** Done
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

- [x] `pnpm-workspace.yaml` + root `package.json` with workspace scripts
- [x] Root + package `tsconfig.json` (strict mode + project references)
- [x] ESLint flat config with `@stylistic` rules (Allman braces, semicolons)
- [x] Toolchain pinning: `.nvmrc`, `packageManager`, `engines`
- [x] `.gitignore` (root) covering all secret/db/generated artefacts
- [x] `.env.example` (placeholders only)
- [x] `LICENSE` (MIT)
- [x] `SECURITY.md`, `CONTRIBUTING.md`
- [x] GitHub Actions workflow running install/lint/typecheck/test/build/gitleaks
- [x] gitleaks configuration + pre-commit hook (lefthook/husky)
- [x] `commitlint` enforcing commit-type rules

## Acceptance criteria

- [x] `pnpm install` works
- [x] `pnpm lint` works
- [x] `pnpm typecheck` works
- [x] `pnpm test` works (even with zero/placeholder tests)
- [~] CI passes (workflow added; the identical lint/typecheck/test/build chain passes locally - the actual CI run is pending the first push, which is deferred per the no-push instruction)
- [x] No local secrets committed (verify with gitleaks + manual `git diff --staged`)

## Safety notes

- Root `.gitignore` must exist before any secret-bearing or generated file is introduced.
- `.env.example` carries placeholders only, never real values.
- License is **MIT**.

## Implementation Checklist

1. [x] Initialise the pnpm workspace: `pnpm-workspace.yaml` + root `package.json` with workspace scripts
2. [x] Add toolchain pins: `.nvmrc` (Node 22), `packageManager` field, `engines`
3. [x] Add root + per-package `tsconfig.json` (strict mode + project references)
4. [x] Configure ESLint flat config (`eslint.config.js`) with `@stylistic` Allman + semicolon rules
5. [x] Add root `.gitignore` covering `.env*`, `*.db*`, `*.sqlite*`, `*.pem`, `*.key`, `data/*` (except `.gitkeep`), build output
6. [x] Add `.env.example` with placeholders only
7. [x] Add `LICENSE` (MIT), `SECURITY.md`, `CONTRIBUTING.md`
8. [x] Create empty `packages/*` and `apps/web/` skeletons (`package.json` only) and `data/.gitkeep`
9. [x] Add gitleaks config, a pre-commit hook (lefthook/husky), and `commitlint`
10. [x] Add the GitHub Actions workflow (install/lint/typecheck/test/build/gitleaks)
11. [x] Run the verification chain and fix any failures

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked (except "CI passes", which is gated on the first push - see note there)
- [x] **Verify:** `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass, and `gitleaks git --staged` is clean
- [x] `git status` + `git diff --staged` reviewed; no secrets or DB files staged; PRD PDF still ignored
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `build: Scaffold pnpm workspace foundation`
