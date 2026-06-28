"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderSearch,
  GitBranch,
  LayoutDashboard,
  HeartPulse,
  Lightbulb,
  ScrollText,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem
{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan-targets", label: "Scan targets", icon: FolderSearch },
  { href: "/git", label: "Git", icon: GitBranch },
  { href: "/sensitive", label: "Sensitive files", icon: ShieldAlert },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/audit-log", label: "Audit log", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar()
{
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Stirilo
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) =>
        {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
