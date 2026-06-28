// Deterministic placeholder used for every redacted value.
export const REDACTED = "[REDACTED]";

interface RedactionRule
{
  name: string;
  pattern: RegExp;
  replacement: string;
}

// Order matters: multi-line blocks and structured values first, then standalone
// token shapes, then the generic key/value sweep.
const RULES: RedactionRule[] = [
  {
    name: "private-key-block",
    pattern:
      /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g,
    replacement: REDACTED,
  },
  {
    name: "db-url-credentials",
    pattern: /([a-z][a-z0-9+.-]*:\/\/[^:/?#\s]+):[^@/?#\s]+@/gi,
    replacement: `$1:${REDACTED}@`,
  },
  {
    name: "github-token",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
    replacement: REDACTED,
  },
  {
    name: "openai-key",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
    replacement: REDACTED,
  },
  {
    name: "aws-access-key-id",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    replacement: REDACTED,
  },
  {
    name: "jwt",
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    replacement: REDACTED,
  },
  {
    name: "bearer-token",
    pattern: /\bBearer\s+[A-Za-z0-9._-]+/g,
    replacement: `Bearer ${REDACTED}`,
  },
  {
    name: "key-value-secret",
    pattern:
      /\b(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|auth)("?\s*[=:]\s*"?)([^"\s,;]+)/gi,
    replacement: `$1$2${REDACTED}`,
  },
];

// Replace common secret patterns in arbitrary text with a deterministic marker.
export function redact(input: string): string
{
  let output = input;
  for (const rule of RULES)
  {
    output = output.replace(rule.pattern, rule.replacement);
  }
  return output;
}
