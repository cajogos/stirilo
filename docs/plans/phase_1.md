# Phase 1: Web App Shell

**Status:** Not started
**Depends on:** Phase 0
**PRD reference:** Milestone 1, Implementation Order steps 2-3

## Goal

A running Next.js application with the visual shell in place: layout, navigation, theming, and placeholder pages, with unauthenticated users redirected to login.

## In scope

- Next.js app (App Router) in `apps/web/`
- Tailwind CSS
- shadcn/ui component setup + lucide-react icons
- Dark mode support
- Sidebar navigation + top bar layout, status indicators
- Placeholder pages: `/login`, `/dashboard`, `/settings`, `/health`
- Redirect to `/login` when unauthenticated (shell-level guard; real auth lands in Phase 2)

## Out of scope

- Real authentication / sessions (Phase 2)
- Database access (Phase 2)
- Scan, Git, and dashboard data (Phases 3-6)

## Deliverables

- [ ] Next.js app boots via `pnpm dev` on the configured port
- [ ] Tailwind + shadcn/ui + dark mode wired up
- [ ] Dashboard layout: sidebar, top bar, content area
- [ ] Reusable UI primitives: cards, tables, empty/error/loading states
- [ ] Login, dashboard shell, settings, health pages (static/placeholder)
- [ ] Basic Playwright smoke test

## Acceptance criteria

- [ ] `pnpm dev` starts the web app
- [ ] Homepage redirects to `/login` when unauthenticated
- [ ] Login page renders
- [ ] Dashboard renders after (stubbed) login
- [ ] Basic Playwright smoke test passes

## Recommendations / Watch-outs

- **Do the unauthenticated redirect in Next.js middleware**, behind a swappable stub seam, so Phase 2b drops in real server-side session validation without restructuring.
- **Set the dev port to 3157** to match the PRD and `.env.example` (not Next's default 3000).
- Use **`next-themes`** for the dark-mode requirement.

## Safety notes

- Default bind address `127.0.0.1`; do not bind to LAN.
- No environment variables are rendered into client components.

## Implementation Checklist

1. [ ] Create the Next.js app (App Router) in `apps/web/`
2. [ ] Configure the dev server to run on port 3157
3. [ ] Add Tailwind CSS
4. [ ] Add shadcn/ui + lucide-react; wire `next-themes` for dark mode
5. [ ] Build the dashboard layout: sidebar, top bar, content area, status indicators
6. [ ] Add reusable UI primitives: card, table, empty/error/loading states
7. [ ] Add placeholder pages: `/login`, `/dashboard`, `/settings`, `/health`
8. [ ] Add Next.js middleware redirecting unauthenticated users to `/login` (swappable stub seam)
9. [ ] Add a basic Playwright smoke test

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** `pnpm dev` serves on `127.0.0.1:3157` and redirects to `/login`; `pnpm test:e2e` smoke test passes
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally, no push: `feat: Add Next.js web app shell`
