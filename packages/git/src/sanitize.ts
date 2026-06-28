export interface SanitizedRemote
{
  url: string | null;
  host: string | null;
}

// Remove any embedded credentials from a Git remote URL before storing or
// displaying it. Handles URL form (https://, ssh://) and scp-like form
// (git@host:path). Never returns a token or password.
export function sanitizeRemoteUrl(raw: string | null | undefined): SanitizedRemote
{
  if (!raw)
  {
    return { url: null, host: null };
  }
  const trimmed = raw.trim();
  if (!trimmed)
  {
    return { url: null, host: null };
  }

  // URL form (has a scheme + "://"): strip userinfo via the URL parser.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed))
  {
    try
    {
      const url = new URL(trimmed);
      url.username = "";
      url.password = "";
      return { url: url.toString(), host: url.hostname || null };
    }
    catch
    {
      return { url: null, host: null };
    }
  }

  // scp-like form: [user@]host:path (no scheme). The user part is the SSH user
  // (e.g. "git@"), not a secret, so it is preserved; the host is extracted.
  const scp = trimmed.match(/^([^@/]+@)?([^/:]+):(.+)$/);
  if (scp)
  {
    const host = scp[2] ?? null;
    return { url: trimmed, host };
  }

  return { url: trimmed, host: null };
}
