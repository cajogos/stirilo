import { redact } from "@stirilo/redaction";
import { requireAgent } from "@/server/api";
import { getCurrentSession } from "@/server/session";
import { listAuditEntries } from "@/server/audit-log";

// Export the audit log as a downloadable file. JSON by default; ?format=csv for
// CSV. Accepts either a logged-in session (so the UI download link works) or the
// agent token (for API/MCP callers). Output is passed through redaction
// defensively, though audit entries are designed never to contain secrets.
export async function GET(request: Request): Promise<Response>
{
  const session = await getCurrentSession();
  if (!session)
  {
    const denied = requireAgent(request);
    if (denied)
    {
      return denied;
    }
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const entries = listAuditEntries(10_000);

  if (format === "csv")
  {
    const header = [
      "id",
      "createdAt",
      "actor",
      "action",
      "targetType",
      "targetId",
      "metadataJson",
    ];
    const rows = entries.map((e) =>
      [
        e.id,
        e.createdAt,
        e.actor,
        e.action,
        e.targetType ?? "",
        e.targetId ?? "",
        e.metadataJson ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = redact([header.join(","), ...rows].join("\n"));
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="stirilo-audit-log.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  const json = redact(JSON.stringify({ auditLog: entries }, null, 2));
  return new Response(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="stirilo-audit-log.json"',
      "Cache-Control": "no-store",
    },
  });
}

export const dynamic = "force-dynamic";
