# Phase 9: Command Runner (Design Only)

**Status:** Done
**Depends on:** Phase 8
**PRD reference:** Milestone 9, Implementation Order step (command runner design)

## Goal

Document a safe future command-execution model. **No command runner is implemented in v0.1** - this phase produces design and security analysis only.

## In scope

- `docs/command-runner.md`
- Allowlist design (no arbitrary shell strings; allowlisted commands only, argument validation)
- Sudo helper design (explicitly installed helper, e.g. `/usr/local/bin/stirilo-helper`; app never runs as root)
- Redaction rules for command output
- Audit rules for command runs
- Risk analysis

## Out of scope

- Any actual command execution implementation
- Any sudo automation

## Deliverables

- [x] `docs/command-runner.md` covering allowlist, sudo helper, redaction, audit, and risk analysis
- [x] Documented safe command categories (`df`, `free`, `uptime`, `lsblk`, `systemctl status`, `journalctl -u`, `docker ps`, `docker compose ps`, `git status`)
- [x] Documented forbidden commands (`rm`, `chmod`, `chown`, `dd`, `mkfs`, `userdel`, `usermod`, `passwd`, `iptables`, `ufw`, `systemctl stop/restart`, `docker rm`, `docker volume rm`)

## Acceptance criteria

- [x] No arbitrary command runner implemented yet
- [x] Future command model is documented
- [x] Security boundaries are explicit

## Recommendations / Watch-outs

- The deliverable is a real **threat model**, not a sketch: an allowlist (argv-validated) plus a separately-installed helper invoked via a **narrow sudoers entry for specific argv**. The web process must never hold privilege. Document *why* each forbidden command is forbidden.

## Safety notes

- Do not implement execution until scan, Git, API, auth, and the security model are solid and proven.
- The web app must never run as root; no automatic sudo.
- Required for any future runner: timeout, output size limit, redaction, audit logging.

## Implementation Checklist

> Design and documentation only - **no executable code** in this phase.

1. [x] Write `docs/command-runner.md`
2. [x] Document the allowlist + argv-validation design
3. [x] Document the sudo helper design (narrow sudoers entry; web process never privileged)
4. [x] Document redaction + audit rules for command runs
5. [x] Write the threat model / risk analysis, with rationale for each forbidden command

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `docs/command-runner.md` reviewed; confirm no command-runner code was added (`git diff` is docs-only)
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `docs: Add command runner design and threat model`
