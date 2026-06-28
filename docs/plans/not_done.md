# Not Done

All v0.1 build phases (0-10) are complete and were verified locally (lint,
typecheck, unit tests, e2e, build, gitleaks). The phase files have been removed.
The outstanding pieces carried over from those phases have been promoted into
the post-v0.1 roadmap (see [README.md](README.md)); they are tracked below by
their owning phase.

## Promoted to Phase 11 (Close v0.1 Open Loops)

- **CI verification (from Phase 0 / Phase 10):** the GitHub Actions workflow
  exists and the chain (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  + gitleaks) passes locally, but **CI has never actually run** because nothing
  has been pushed yet (push is deliberately deferred).
- **zod-to-openapi auto-generation (from Phase 7):** `docs/api.md` is hand-written;
  generate it and the Phase 8 MCP tool schemas from a single Zod/OpenAPI source so
  they can't drift.
- **Dedicated build dir for CI/e2e:** `pnpm build`/`pnpm test:e2e` share
  `apps/web/.next` with `pnpm dev` and can corrupt a running dev server; a
  separate `distDir` for verification runs would prevent that.

## Promoted to Phase 13 (Git Intelligence)

- **Git remote freshness:** the git scanner is read-only and never fetches, so
  ahead/behind reflect local refs only. A "remote last commit" / true
  ahead-behind column would require `git fetch` during scans (a behavior change),
  now scoped as an off-by-default toggle in Phase 13.

## Notes / ideas raised during the build (no phase yet)

- **Relative commit times** ("x ago") in the git table were left as absolute
  dates to avoid client/server hydration mismatches.
