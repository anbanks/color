"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { PanelLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
  pageTitle?: string;
}

export function AdminLayoutClient({ user, children, pageTitle }: AdminLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <AdminSidebar user={user} collapsed={collapsed} />
      <div className="flex-1 min-w-0 admin-main flex flex-col">
        {/* Top bar with collapse toggle */}
        <div className="h-[52px] flex items-center gap-3 px-5 border-b border-gray-200/60 dark:border-white/[0.06] shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/50 transition-colors"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <Separator orientation="vertical" className="h-4 dark:bg-white/[0.06]" />
          {pageTitle && (
            <span className="text-[14px] text-gray-500 dark:text-white/40">{pageTitle}</span>
          )}
        </div>
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
