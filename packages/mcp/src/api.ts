export interface ApiClient
{
  get(path: string): Promise<unknown>;
}

// Thin client over the Stirilo HTTP API. The MCP server talks to the API rather
// than the database, so auth, audit, and redaction stay centralized there.
export function createApiClient(
  baseUrl: string,
  token: string,
): ApiClient
{
  const base = baseUrl.replace(/\/$/, "");
  return {
    async get(path: string): Promise<unknown>
    {
      const response = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
      {
        throw new Error(`Stirilo API ${path} returned ${response.status}`);
      }
      return response.json();
    },
  };
}
