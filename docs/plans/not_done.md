# Not Done

All v0.1 build phases (0-10) are complete and were verified locally (lint,
typecheck, unit tests, e2e, build, gitleaks). The phase files have been removed.
The items below are the only outstanding pieces carried over from those phases.

## CI verification (from Phase 0 / Phase 10)

- The GitHub Actions workflow exists and the identical chain
  (`pnpm lint && pnpm typecheck && pnpm test && pnpm build` + gitleaks) passes
  locally, but **CI has never actually run** because nothing has been pushed yet
  (push is deliberately deferred).
- **To close:** push to GitHub and confirm the CI workflow goes green.

## zod-to-openapi auto-generation (from Phase 7)

- `docs/api.md` is currently hand-written.
- The recommendation was to generate `docs/api.md` and the Phase 8 MCP tool
  schemas from a single Zod/OpenAPI source so they can't drift.
- **To close:** add `zod-to-openapi`, derive route/tool schemas from shared Zod
  definitions, and generate the API doc from them.

## Notes / ideas raised during the build (optional, not phase commitments)

- **Git remote freshness:** the git scanner is read-only and never fetches, so
  ahead/behind reflect local refs only. A "remote last commit" / true
  ahead-behind column would require `git fetch` during scans (a behavior change).
- **Relative commit times** ("x ago") in the git table were left as absolute
  dates to avoid client/server hydration mismatches.
- **Dedicated build dir for CI/e2e:** running `pnpm build`/`pnpm test:e2e` shares
  `apps/web/.next` with `pnpm dev` and can corrupt a running dev server. A
  separate `distDir` for verification runs would prevent that.
