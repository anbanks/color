"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Palette,
  ArrowLeft,
  Sun,
  Moon,
  Globe,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useLocale();
  const { theme, setTheme } = useTheme();
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
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 bg-white dark:bg-[#1a1a1a] border-r border-gray-200/60 dark:border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center">
            <Palette className="h-5 w-5 text-white dark:text-white/80" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Color Admin</h2>
            <p className="text-[11px] text-gray-400">{t.admin.moderation}</p>
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

      {/* Back to site */}
      <div className="px-3 pt-2">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-700 dark:hover:text-white/70 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "pt" ? "Voltar ao site" : locale === "es" ? "Volver al sitio" : "Back to site"}
        </Link>
      </div>

      {/* User menu */}
      <div className="p-3 pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all outline-none">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[12px] font-semibold text-gray-600 dark:text-white/60 shrink-0">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">{user.email}</p>
            </div>
            <ChevronUp className="h-4 w-4 text-gray-400 dark:text-white/30 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[236px] rounded-xl shadow-xl border-gray-200/80 dark:border-white/10 dark:bg-[#252525] p-1.5 mb-1"
          >
            {/* Theme */}
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

            {/* Language */}
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                className={cn(
                  "rounded-lg px-3 py-2 text-[13px] cursor-pointer",
                  locale === lang.code && "font-medium"
                )}
                onClick={() => switchLocale(lang.code)}
              >
                <Globe className="h-4 w-4 mr-2.5 text-gray-400" />
                {lang.label}
                {locale === lang.code && <span className="ml-auto text-[11px] text-gray-400">✓</span>}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="dark:bg-white/[0.06]" />

            {/* Sign out */}
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
