import * as React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>)
{
  const session = await getCurrentSession();
  if (!session)
  {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar username={session.username} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
