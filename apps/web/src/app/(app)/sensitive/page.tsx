import { getSensitiveInventory } from "@/server/insights";
import { formatBytes } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SensitiveFilesPage()
{
  const inventory = getSensitiveInventory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sensitive files
        </h1>
        <p className="text-sm text-muted-foreground">
          Detected by name during scans. Metadata only: path, size, modified
          time, and rule. Stirilo never reads or stores their contents.
        </p>
      </div>

      {inventory.totalCount === 0 ? (
        <EmptyState
          title="No sensitive files detected"
          description="Run a scan on a target to detect .env, key, and other sensitive markers."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Card className="min-w-40">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{inventory.totalCount}</p>
                <p className="text-sm text-muted-foreground">Total markers</p>
              </CardContent>
            </Card>
            {inventory.byRule.map((r) => (
              <Card key={r.rule} className="min-w-40">
                <CardContent className="pt-6">
                  <p className="text-2xl font-semibold">{r.count}</p>
                  <p className="text-sm text-muted-foreground">{r.rule}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {inventory.groups.map((group) => (
            <Card key={group.targetId}>
              <CardHeader>
                <CardTitle>{group.targetName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {group.targetPath}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Path</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead>Modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.markers.map((m) => (
                      <TableRow key={m.path}>
                        <TableCell className="font-mono text-xs">
                          {m.path}
                        </TableCell>
                        <TableCell>{m.rule}</TableCell>
                        <TableCell className="text-right">
                          {formatBytes(m.size)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.modifiedAt.slice(0, 10)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
