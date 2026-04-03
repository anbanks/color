"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Shuffle, Heart } from "lucide-react";

const navItems = [
  { path: "", label: "New", icon: Sparkles },
  { path: "/popular", label: "Popular", icon: Clock },
  { path: "/random", label: "Random", icon: Shuffle },
  { path: "/collections", label: "Collection", icon: Heart },
];

const tags = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Sunset",
];

export function Sidebar() {
  const pathname = usePathname();
  const { locale } = useLocale();

  const tagMatch = pathname.match(/\/palettes\/([^/]+)/);
  const activeTag = tagMatch ? tagMatch[1] : null;

  return (
    <aside className="w-[160px] shrink-0 hidden md:block pt-2">
      <nav className="sticky top-[76px]">
        <div className="space-y-[2px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.path}`;
            const isActive =
              !activeTag && (
                (item.path === "" && (pathname === `/${locale}` || pathname === `/${locale}/` || pathname === `/${locale}/new`)) ||
                (item.path !== "" && pathname.startsWith(href))
              );

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex items-center gap-3 py-[10px] text-[15px] transition-colors",
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100">
          <div className="space-y-[1px]">
            {tags.map((tag) => {
              const isActive = activeTag === tag.toLowerCase();
              return (
                <Link
                  key={tag}
                  href={`/${locale}/palettes/${tag.toLowerCase()}`}
                  className={cn(
                    "block py-[5px] text-[14px] transition-colors",
                    isActive
                      ? "text-gray-900 font-medium"
                      : "text-gray-400 hover:text-gray-700"
                  )}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
