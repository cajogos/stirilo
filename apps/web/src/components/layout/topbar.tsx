import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/layout/logout-button";

interface TopbarProps
{
  username: string;
}

export function Topbar({ username }: TopbarProps)
{
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Local-first &middot; 127.0.0.1</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{username}</span>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
