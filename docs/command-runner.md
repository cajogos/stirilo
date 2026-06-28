# Command Runner (Design Only)

**Status: design document. No command runner is implemented in v0.1.**

Stirilo v0.1 is read-only. This document specifies how a future command runner
could be added safely, so that the security boundaries are explicit before any
execution code exists. It is deliberately conservative: when in doubt, do less.

## Non-negotiable boundaries

- The web application **must never run as root** and must never call `sudo`
  automatically.
- **No arbitrary shell strings.** Commands are never passed to a shell. There is
  no string interpolation into a command line.
- Execution is **allowlisted**: only specific, known commands with validated
  arguments may run.
- Every command run is **audited** and its output is **redacted**.
- The runner ships **disabled by default** and must be explicitly enabled.

## Allowlist design

A command is defined as structured data, never a string:

```
{
  id: "disk-free",
  argv: ["df", "-h"],
  argSchema: <zod schema for any user-supplied arguments>,
  timeoutMs: 5000,
  maxOutputBytes: 65536,
  requiresHelper: false
}
```

Rules:

- Execution uses `execFile`/`spawn` with an argument **array**, never a shell.
- User input may only fill argument slots that a Zod schema validates (e.g. a
  service name matching `^[a-z0-9@._-]+$`); it can never add flags or commands.
- Each command declares a **timeout** and an **output size limit**; both are
  enforced and exceeding them terminates the process.
- Unknown command ids are rejected. There is no "run this string" entry point.

### Safe candidate commands (read-only, non-privileged)

```
df            free          uptime        lsblk
systemctl status <service>  journalctl -u <service> --since <duration>
docker ps     docker compose ps          git status
```

### Forbidden commands (never allowlisted)

```
rm      chmod   chown   dd      mkfs
userdel usermod passwd  iptables ufw
systemctl stop  systemctl restart
docker rm       docker volume rm
```

Each is forbidden because it is destructive, privilege-altering, or
network/security-affecting. A command that mutates state, deletes data, changes
permissions/ownership, manages users, or alters firewall/service lifecycle is
out of scope by policy, not by configuration.

## Privilege / sudo helper design

The web process never holds privilege. Any command that genuinely needs elevation
is delegated to a **separately installed helper** binary:

```
/usr/local/bin/stirilo-helper
```

- The helper is installed deliberately by the operator (not by the app).
- It accepts only a fixed set of helper-specific subcommands with validated
  arguments; it never accepts a shell string.
- A narrow `sudoers` entry grants the Stirilo user permission to run **only**
  that helper with **specific argv**, e.g.:

  ```
  stirilo ALL=(root) NOPASSWD: /usr/local/bin/stirilo-helper status *
  ```

- The helper itself re-validates every argument and enforces the allowlist; it
  does not trust the caller.
- If the helper is not installed, privileged commands are simply unavailable.

## Redaction rules

- All stdout/stderr is passed through the `@stirilo/redaction` package before it
  is stored, displayed, or logged.
- Output is truncated to the command's `maxOutputBytes`.
- Stored fields: `command_name`, `arguments_json`, `exit_code`,
  `stdout_redacted`, `stderr_redacted`, `started_at`, `finished_at`,
  `created_by`. Raw (unredacted) output is never persisted.

## Audit rules

- A `command_runs` row is written for every invocation (requested, started,
  finished, failed).
- An audit-log entry records `command run requested` and the outcome with the
  actor and command id (never the raw output).
- Denials (unknown id, failed argument validation, disabled runner) are audited
  too.

## Threat model / risk analysis

| Threat | Mitigation |
| --- | --- |
| Shell injection | No shell; argv arrays only; no string interpolation |
| Argument injection (extra flags) | Zod-validated argument slots; fixed argv prefix |
| Privilege escalation | App never root; narrow sudoers for one helper + argv |
| Destructive actions | Hard-coded forbidden list; allowlist-only |
| Secret leakage in output | Redaction + output size cap before storage/display |
| Runaway processes | Per-command timeout and output limit |
| Enabled by accident | Disabled by default; explicit opt-in required |
| Audit gaps | Every request and outcome (including denials) audited |

## Implementation gate

Do not implement execution until the scan, Git, API, auth, and security model are
solid and proven (they are, as of v0.1). Even then, the runner stays disabled by
default and ships behind the boundaries above.
