"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface GitRepoRow
{
  id: string;
  name: string;
  path: string;
  branch: string | null;
  isDirty: boolean;
  stagedCount: number;
  unstagedCount: number;
  untrackedCount: number;
  aheadCount: number;
  behindCount: number;
  sizeBytes: number;
  lastCommitDate: string | null;
  lastCommitSubject: string | null;
  remoteHost: string | null;
}

type SortKey = "name" | "branch" | "status" | "size" | "lastCommit";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Repository" },
  { key: "branch", label: "Branch" },
  { key: "status", label: "Status" },
  { key: "size", label: "Size" },
  { key: "lastCommit", label: "Last commit" },
];

function sortValue(row: GitRepoRow, key: SortKey): string | number
{
  switch (key)
  {
    case "name":
      return row.name.toLowerCase();
    case "branch":
      return (row.branch ?? "").toLowerCase();
    case "status":
      return row.isDirty ? 1 : 0;
    case "size":
      return row.sizeBytes;
    case "lastCommit":
      return row.lastCommitDate ?? "";
  }
}

export function GitReposTable({ rows }: { rows: GitRepoRow[] })
{
  const [sortKey, setSortKey] = React.useState<SortKey>("size");
  const [ascending, setAscending] = React.useState(false);

  const sorted = React.useMemo(() =>
  {
    const copy = [...rows];
    copy.sort((a, b) =>
    {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv)
      {
        return ascending ? -1 : 1;
      }
      if (av > bv)
      {
        return ascending ? 1 : -1;
      }
      return 0;
    });
    return copy;
  }, [rows, sortKey, ascending]);

  function toggle(key: SortKey): void
  {
    if (key === sortKey)
    {
      setAscending((prev) => !prev);
    }
    else
    {
      setSortKey(key);
      setAscending(key === "name" || key === "branch");
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableHead key={col.key}>
              <button
                type="button"
                onClick={() => toggle(col.key)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                {col.label}
                {sortKey === col.key ? (
                  ascending ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-40" />
                )}
              </button>
            </TableHead>
          ))}
          <TableHead>Remote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                href={`/git/${row.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {row.name}
              </Link>
              <div className="font-mono text-xs text-muted-foreground">
                {row.path}
              </div>
            </TableCell>
            <TableCell>{row.branch ?? "-"}</TableCell>
            <TableCell>
              <StatusCell row={row} />
            </TableCell>
            <TableCell>{formatBytes(row.sizeBytes)}</TableCell>
            <TableCell className="text-muted-foreground">
              <span>{row.lastCommitDate?.slice(0, 10) ?? "-"}</span>
              {row.lastCommitSubject ? (
                <div className="max-w-[18rem] truncate text-xs">
                  {row.lastCommitSubject}
                </div>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.remoteHost ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusCell({ row }: { row: GitRepoRow })
{
  const diverged = row.aheadCount > 0 && row.behindCount > 0;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={cn(row.isDirty ? "text-destructive" : "text-emerald-500")}>
        {row.isDirty ? "Dirty" : "Clean"}
      </span>
      {diverged ? (
        <span className="text-amber-500">diverged</span>
      ) : null}
      {row.aheadCount > 0 ? (
        <span className="text-muted-foreground">&uarr;{row.aheadCount}</span>
      ) : null}
      {row.behindCount > 0 ? (
        <span className="text-muted-foreground">&darr;{row.behindCount}</span>
      ) : null}
    </div>
  );
}
