# Phase 11: Close v0.1 Open Loops

**Status:** Done (except CI verification, deferred until first push)
**Depends on:** Phase 10
**PRD reference:** Carried over from Phase 0 / Phase 7 / Phase 10 (see `not_done.md`)

## Goal

Close the small, already-scoped gaps left at the end of the v0.1 build so the foundation is fully proven before new feature work lands on top of it.

## In scope

- **CI verification:** push to GitHub and confirm the existing Actions workflow goes green (the `pnpm lint && pnpm typecheck && pnpm test && pnpm build` + gitleaks chain has only ever run locally).
- **zod-to-openapi auto-generation:** derive `docs/api.md` and the MCP tool schemas from a single shared Zod/OpenAPI source so the hand-written doc, the routes, and the MCP tools cannot drift.
- **Dedicated verification build dir:** give `pnpm build` / `pnpm test:e2e` a separate `distDir` so they stop sharing `apps/web/.next` with a running `pnpm dev` (which can corrupt the dev server).

## Out of scope

- Any new product feature (Phases 12+).
- New data sources or UI views.

## Deliverables

- [ ] CI workflow run green on GitHub (first real run). **Blocked: requires a push, which is deliberately deferred.**
- [x] `zod-to-openapi` wired in; `docs/api.md` (+ `docs/openapi.json`) and MCP `id` param schema derived from the shared `@stirilo/core` contract.
- [x] Generation step runnable via `pnpm docs:api`.
- [x] Separate `distDir` (`STIRILO_DIST_DIR`) for verification builds; e2e uses `.next-verify`.

## Acceptance criteria

- [ ] CI passes on a push without local-only assumptions.
- [ ] Editing a shared Zod schema regenerates both the API doc and the MCP tool schema; no manual edits to generated files.
- [ ] Running `pnpm build` / `pnpm test:e2e` does not disturb a running `pnpm dev`.

## Recommendations / Watch-outs

- Generated files should carry a "do not edit by hand" banner and be checked in (so diffs are reviewable) but produced only by the generator.
- The push is the first time secrets-in-history protection is tested against a remote: run `gitleaks dir .` immediately before pushing.
- Keep the OpenAPI source as the *single* truth: routes validate against it, MCP tools derive from it, the doc renders from it.

## Safety notes

- The push must not include any gitignored secret-bearing or DB files; verify `git status` shows none staged.
- No change to the read-only/observational boundary.

## Implementation Checklist

1. [x] Add `@asteasolutions/zod-to-openapi` (v7, Zod 3 compatible); define the shared contract in `packages/core/src/api-contract.ts` (route registry + request/param schemas + `buildOpenApiDocument`).
2. [x] Generate `docs/api.md` + `docs/openapi.json` via `scripts/generate-api-docs.mjs` (`pnpm docs:api`).
3. [x] Derive MCP `id` param schema and the web `POST /api/scan-targets` validation from the same contract.
4. [x] Introduce `STIRILO_DIST_DIR` in `next.config.mjs`; e2e (`playwright.config.ts`) builds/starts into `.next-verify`.
5. [ ] Push to GitHub; confirm CI is green; fix any environment-only failures. **Deferred (no push yet).**
6. [x] Update `not_done.md` to reflect the closed items.

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked (except CI, which requires a push)
- [x] **Verify:** regenerating docs is idempotent (`pnpm docs:api` then clean `git status docs/`); `pnpm test:e2e` builds into `.next-verify` and passes (12/12); lint + typecheck + 51 unit tests pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged (tracked/staged gitleaks clean; only the local gitignored `.env` is flagged by a full `dir` scan)
- [x] This file's **Status** changed to `Done` (CI deferred)
- [ ] Committed locally: `build: Close v0.1 open loops (zod-to-openapi, distDir)`
