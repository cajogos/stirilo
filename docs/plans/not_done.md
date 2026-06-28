# Not Done

All build phases (0-16) are complete and verified. The v0.1 phases (0-10) were
verified locally; the post-v0.1 phases (11-16, see [README.md](README.md)) were
verified locally and on CI. There are no outstanding phase commitments.

## Closed

- **CI verification (Phase 11):** CLOSED. `main` was pushed and the GitHub
  Actions workflow ran green (lint + typecheck + test + build + gitleaks).
- **zod-to-openapi auto-generation (Phase 11):** DONE.
- **Dedicated build dir for CI/e2e (Phase 11):** DONE (`STIRILO_DIST_DIR`).
- **Git remote freshness (Phase 13):** DONE as an off-by-default fetch toggle.

## Notes / ideas (optional, no phase)

- **Relative commit times** ("x ago") in the git table were left as absolute
  dates to avoid client/server hydration mismatches.
- **GitHub Actions Node 20 deprecation:** the CI run warns that pinned actions
  (`actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`,
  `gitleaks/gitleaks-action@v2`) target Node 20, which GitHub is retiring on the
  runners (forced to Node 24 for now). Non-blocking; bump the action versions
  when convenient.
