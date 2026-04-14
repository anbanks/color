"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { PanelLeft } from "lucide-react";

interface AdminLayoutClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed(!collapsed);

  return (
    <div className="flex">
      <AdminSidebar user={user} collapsed={collapsed} onToggle={toggle} />
      <div className="flex-1 min-w-0 admin-main flex flex-col">
        {/* Top bar — only shows expand button when collapsed */}
        {collapsed && (
          <div className="h-[48px] flex items-center px-4 border-b border-gray-200/60 dark:border-white/[0.06] shrink-0">
            <button
              onClick={toggle}
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
