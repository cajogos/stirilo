# Not Done

All v0.1 build phases (0-10) are complete and were verified locally (lint,
typecheck, unit tests, e2e, build, gitleaks). The phase files have been removed.
The outstanding pieces carried over from those phases have been promoted into
the post-v0.1 roadmap (see [README.md](README.md)); they are tracked below by
their owning phase.

## Phase 11 (Close v0.1 Open Loops) - done except CI

- **zod-to-openapi auto-generation:** DONE. `docs/api.md` + `docs/openapi.json`
  are generated from `@stirilo/core`'s contract via `pnpm docs:api`; the web
  route validation and MCP `id` param derive from the same source.
- **Dedicated build dir for CI/e2e:** DONE. `STIRILO_DIST_DIR` drives the Next
  `distDir`; e2e builds/starts into `.next-verify`.
- **CI verification (from Phase 0 / Phase 10):** STILL OPEN. The chain passes
  locally but **CI has never actually run** because nothing has been pushed yet
  (push is deliberately deferred). To close: push and confirm CI goes green.

## Promoted to Phase 13 (Git Intelligence)

- **Git remote freshness:** the git scanner is read-only and never fetches, so
  ahead/behind reflect local refs only. A "remote last commit" / true
  ahead-behind column would require `git fetch` during scans (a behavior change),
  now scoped as an off-by-default toggle in Phase 13.

## Notes / ideas raised during the build (no phase yet)

- **Relative commit times** ("x ago") in the git table were left as absolute
  dates to avoid client/server hydration mismatches.
