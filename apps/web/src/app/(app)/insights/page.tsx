import {
  getDiskReport,
  getDuplicateReport,
  getProjectInventory,
} from "@/server/insights";
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

export default function InsightsPage()
{
  const disk = getDiskReport();
  const duplicates = getDuplicateReport();
  const projects = getProjectInventory();

  if (!disk.hasData)
  {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="No scan data yet"
          description="Run a scan on a target to populate disk, duplicate, and project insights."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="flex flex-wrap gap-3">
        <Stat label="Scanned size" value={formatBytes(disk.totalSize)} />
        <Stat
          label="Reclaimable (artifacts)"
          value={formatBytes(disk.reclaimableBytes)}
        />
        <Stat
          label="Duplicate waste"
          value={formatBytes(duplicates.totalWastedBytes)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reclaimable artifact directories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Build/dependency directories (node_modules, dist, .next, …) measured
            by metadata only. Safe to regenerate.
          </p>
        </CardHeader>
        <CardContent>
          {disk.artifactDirectories.length === 0 ? (
            <p className="text-sm text-muted-foreground">None found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Directory</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disk.artifactDirectories.map((d) => (
                  <TableRow key={`${d.target}:${d.path}`}>
                    <TableCell className="font-mono text-xs">{d.path}</TableCell>
                    <TableCell>{d.target}</TableCell>
                    <TableCell className="text-right">
                      {formatBytes(d.size)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Largest files</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disk.largestFiles.map((f) => (
                  <TableRow key={`${f.target}:${f.path}`}>
                    <TableCell className="font-mono text-xs">{f.path}</TableCell>
                    <TableCell className="text-right">
                      {formatBytes(f.size)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Largest directories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disk.largestDirectories.map((d) => (
                  <TableRow key={`${d.target}:${d.path}`}>
                    <TableCell className="font-mono text-xs">{d.path}</TableCell>
                    <TableCell className="text-right">
                      {formatBytes(d.size)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Potential duplicates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Non-sensitive files sharing the same size and name. Heuristic: no
            file contents are read, so confirm before deleting.
          </p>
        </CardHeader>
        <CardContent>
          {duplicates.groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">None found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Copies</TableHead>
                  <TableHead className="text-right">Each</TableHead>
                  <TableHead className="text-right">Wasted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicates.groups.map((g, i) => (
                  <TableRow key={`${g.target}:${g.name}:${i}`}>
                    <TableCell className="font-mono text-xs">{g.name}</TableCell>
                    <TableCell className="text-right">{g.count}</TableCell>
                    <TableCell className="text-right">
                      {formatBytes(g.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBytes(g.wastedBytes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detected project/framework markers across scanned targets.
          </p>
        </CardHeader>
        <CardContent>
          {projects.markers.length === 0 ? (
            <p className="text-sm text-muted-foreground">None detected.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marker</TableHead>
                  <TableHead className="text-right">Targets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.markers.map((m) => (
                  <TableRow key={m.marker}>
                    <TableCell>{m.marker}</TableCell>
                    <TableCell className="text-right">
                      {m.targets.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Header()
{
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
      <p className="text-sm text-muted-foreground">
        Disk reclamation, duplicate candidates, and project inventory derived
        from the latest scan of each target.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string })
{
  return (
    <Card className="min-w-44">
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
