import "server-only";
import os from "node:os";

export interface SystemSummary
{
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptimeSeconds: number;
  totalMemory: number;
  freeMemory: number;
}

// Read-only, non-privileged system information.
export function getSystemSummary(): SystemSummary
{
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptimeSeconds: Math.round(os.uptime()),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  };
}
