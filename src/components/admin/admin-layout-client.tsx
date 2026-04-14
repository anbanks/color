"use client";

import { AdminSidebar } from "./admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { CSSProperties } from "react";

interface AdminLayoutClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

const sidebarStyle = {
  "--sidebar": "#0a0a0a",
  "--sidebar-foreground": "oklch(0.92 0 0)",
  "--sidebar-accent": "#171717",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-primary": "#FEED30",
  "--sidebar-primary-foreground": "#111111",
  "--sidebar-border": "rgba(255,255,255,0.06)",
  "--sidebar-ring": "rgba(255,255,255,0.15)",
} as CSSProperties;

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  return (
    <div className="dark">
      <SidebarProvider style={sidebarStyle}>
        <AdminSidebar user={user} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex-1 admin-zoom">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
