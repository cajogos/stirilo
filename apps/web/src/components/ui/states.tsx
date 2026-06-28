import * as React from "react";
import { cn } from "@/lib/utils";

interface StateProps
{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

// Empty state: shown when a list or page has no data yet.
export function EmptyState({ title, description, icon, action, className }: StateProps)
{
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// Error state: shown when something failed to load.
export function ErrorState({ title, description, action, className }: StateProps)
{
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-destructive/40 bg-destructive/5 p-10 text-center",
        className,
      )}
    >
      <p className="font-medium text-destructive">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// Loading state: a simple skeleton placeholder.
export function LoadingState({ className }: { className?: string })
{
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-24 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}
