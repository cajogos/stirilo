import { getCurrentSession } from "@/server/session";
import { executeScan, type ScanEvent } from "@/server/services/scan-service";

// Session-authenticated streaming scan. Emits newline-delimited JSON events as
// the scan progresses so the UI can show live toasts. Lives outside /api so the
// session middleware applies (the API routes use the agent token instead).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response>
{
  const session = await getCurrentSession();
  if (!session)
  {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller)
    {
      const send = (event: ScanEvent): void =>
      {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try
      {
        await executeScan(session.username, id, send);
      }
      catch
      {
        send({ type: "error", message: "Scan failed." });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const dynamic = "force-dynamic";
