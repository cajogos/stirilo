# Phase 11: Close v0.1 Open Loops

**Status:** Planned
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

- [ ] CI workflow run green on GitHub (first real run).
- [ ] `zod-to-openapi` wired in; `docs/api.md` and MCP tool schemas generated from shared Zod definitions.
- [ ] Generation step documented and runnable (e.g. `pnpm docs:api`).
- [ ] Separate `distDir` for verification builds; documented in the build/test commands.

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

1. [ ] Add `zod-to-openapi`; define shared request/response schemas in one place.
2. [ ] Generate `docs/api.md` from the OpenAPI document; add a generate script.
3. [ ] Derive MCP tool schemas (Phase 8) from the same source.
4. [ ] Introduce a verification `distDir` and update `pnpm build` / `pnpm test:e2e`.
5. [ ] Push to GitHub; confirm CI is green; fix any environment-only failures.
6. [ ] Remove the corresponding items from `not_done.md`.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** CI green on GitHub; regenerating docs produces no diff after a clean run; `pnpm test:e2e` runs alongside `pnpm dev` without corruption
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `build: Close v0.1 open loops (CI, zod-to-openapi, distDir)`
