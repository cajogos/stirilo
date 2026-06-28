import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { listAuditEntries } from "@/server/audit-log";

export default function AuditLogPage()
{
  const entries = listAuditEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Recent recorded actions. Secrets are never logged.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No audit entries yet"
          description="Actions like logins and scans will appear here."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.createdAt}
                    </TableCell>
                    <TableCell>{entry.actor}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.targetType ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
