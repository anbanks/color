"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Palette,
  Sun,
  Moon,
  Globe,
  LogOut,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const base = `/${locale}/admin`;

  const navItems = [
    { href: "", label: t.admin.dashboard, icon: LayoutDashboard },
    { href: "/palettes", label: t.admin.palettesTitle, icon: Palette },
  ];

  const languages = [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
  ];

  const switchLocale = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  };

  return (
    <aside className={cn(
      "shrink-0 h-screen sticky top-0 bg-white dark:bg-[#1a1a1a] border-r border-gray-200/60 dark:border-white/[0.06] flex flex-col transition-all duration-200",
      collapsed ? "w-[68px]" : "w-[260px]"
    )}>
      {/* Header + Collapse toggle */}
      <div className={cn("flex items-center", collapsed ? "p-3 justify-center" : "p-4 pb-3")}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <PanelLeftOpen className="h-4 w-4 text-white dark:text-white/80" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center shrink-0">
                <Palette className="h-5 w-5 text-white dark:text-white/80" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Color Admin</h2>
                <p className="text-[11px] text-gray-400">{t.admin.moderation}</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <Separator className="dark:bg-white/[0.06]" />

      {/* Nav */}
      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = `${base}${item.href}`;
          const isActive = item.href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);

          const link = (
            <Link
              href={href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-150",
                collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && item.label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger className="w-full">{link}</TooltipTrigger>
                <TooltipContent side="right" className="text-[12px]">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{link}</div>;
        })}
      </nav>

      <Separator className="dark:bg-white/[0.06]" />

      {/* User menu */}
      <div className={cn("p-2", collapsed && "flex justify-center")}>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex items-center rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all outline-none",
            collapsed ? "h-10 w-10 justify-center" : "w-full gap-3 px-3 py-2.5"
          )}>
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[12px] font-semibold text-gray-600 dark:text-white/60 shrink-0">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 text-left flex-1">
                  <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">{user.email}</p>
                </div>
                <ChevronUp className="h-4 w-4 text-gray-400 dark:text-white/30 shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={collapsed ? "right" : "top"}
            align={collapsed ? "end" : "start"}
            className="w-[220px] rounded-xl shadow-xl border-gray-200/80 dark:border-white/10 dark:bg-[#252525] p-1.5 mb-1"
          >
            <DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[13px] cursor-pointer"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 mr-2.5 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 mr-2.5 text-gray-500" />
              )}
              {theme === "dark"
                ? (locale === "pt" ? "Modo claro" : locale === "es" ? "Modo claro" : "Light mode")
                : (locale === "pt" ? "Modo escuro" : locale === "es" ? "Modo oscuro" : "Dark mode")}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="dark:bg-white/[0.06]" />

            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                className={cn("rounded-lg px-3 py-2 text-[13px] cursor-pointer", locale === lang.code && "font-medium")}
                onClick={() => switchLocale(lang.code)}
              >
                <Globe className="h-4 w-4 mr-2.5 text-gray-400" />
                {lang.label}
                {locale === lang.code && <span className="ml-auto text-[11px] text-gray-400">✓</span>}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="dark:bg-white/[0.06]" />

            <DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[13px] text-red-600 dark:text-red-400 cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2.5" />
              {t.menu.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
