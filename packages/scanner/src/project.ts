// Detect package/project marker files by NAME. Returns a marker label or null.
const EXACT_MARKERS = new Map<string, string>([
  ["package.json", "node-package"],
  ["pnpm-lock.yaml", "pnpm-lockfile"],
  ["package-lock.json", "npm-lockfile"],
  ["yarn.lock", "yarn-lockfile"],
  ["bun.lockb", "bun-lockfile"],
  ["tsconfig.json", "typescript-config"],
  ["docker-compose.yml", "docker-compose"],
  ["compose.yml", "docker-compose"],
  ["Dockerfile", "dockerfile"],
  ["README.md", "readme"],
  ["Cargo.toml", "rust-package"],
  ["go.mod", "go-module"],
  ["pyproject.toml", "python-project"],
  ["requirements.txt", "python-requirements"],
]);

export function detectProjectMarker(name: string): string | null
{
  const exact = EXACT_MARKERS.get(name);
  if (exact)
  {
    return exact;
  }
  if (name.startsWith("vite.config."))
  {
    return "vite-config";
  }
  if (name.startsWith("next.config."))
  {
    return "next-config";
  }
  return null;
}
