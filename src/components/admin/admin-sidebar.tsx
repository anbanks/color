"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const navItems = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/palettes", label: "Palettes", icon: Palette },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const base = `/${locale}/admin`;

  return (
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 bg-white dark:bg-[#1a1a1a] border-r border-gray-200/60 dark:border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center">
            <Palette className="h-5 w-5 text-white dark:text-white/80" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Color Admin</h2>
            <p className="text-[11px] text-gray-400">Management Panel</p>
          </div>
        </div>
      </div>

      <Separator className="dark:bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = `${base}${item.href}`;
          const isActive = item.href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-150",
                isActive
                  ? "bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="dark:bg-white/[0.06]" />

      {/* User + Back */}
      <div className="p-3 space-y-1">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-700 dark:hover:text-white/70 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[12px] font-semibold text-gray-600 dark:text-white/60">
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">{user.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
