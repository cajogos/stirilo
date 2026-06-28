"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ScanRunButtonProps
{
  targetId: string;
}

interface ScanEvent
{
  type: "progress" | "repo" | "done" | "error";
  files?: number;
  path?: string;
  directories?: number;
  sensitive?: number;
  repos?: number;
  message?: string;
}

// Runs a scan via the streaming endpoint and shows live toasts as repositories
// and progress are reported.
export function ScanRunButton({ targetId }: ScanRunButtonProps)
{
  const [scanning, setScanning] = React.useState(false);
  const router = useRouter();

  async function run(): Promise<void>
  {
    setScanning(true);
    const progressId = toast.loading("Scanning…");

    try
    {
      const response = await fetch(`/scan-stream/${targetId}`, {
        method: "POST",
      });
      if (!response.ok || !response.body)
      {
        throw new Error("request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;)
      {
        const { value, done } = await reader.read();
        if (done)
        {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines)
        {
          if (!line.trim())
          {
            continue;
          }
          const event = JSON.parse(line) as ScanEvent;
          if (event.type === "repo")
          {
            toast.message("Repository found", { description: event.path });
          }
          else if (event.type === "progress")
          {
            toast.loading(`Scanned ${event.files} files…`, { id: progressId });
          }
          else if (event.type === "done")
          {
            toast.success(
              `Scanned ${event.files} files, ${event.repos} repos, ${event.sensitive} sensitive`,
              { id: progressId },
            );
          }
          else if (event.type === "error")
          {
            toast.error(event.message ?? "Scan failed.", { id: progressId });
          }
        }
      }

      router.refresh();
    }
    catch
    {
      toast.error("Scan failed.", { id: progressId });
    }
    finally
    {
      setScanning(false);
    }
  }

  return (
    <Button onClick={run} disabled={scanning}>
      {scanning ? "Scanning…" : "Run scan"}
    </Button>
  );
}
