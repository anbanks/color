"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Shuffle, Heart } from "lucide-react";

const navItems = [
  { key: "new", label: "New", icon: Sparkles },
  { key: "popular", label: "Popular", icon: Clock },
  { key: "random", label: "Random", icon: Shuffle },
  { key: "collection", label: "Collection", icon: Heart, href: "/collections" },
];

const tags = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Sunset",
];

export function Sidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get("sort") || "new";
  const { locale } = useLocale();

  const tagMatch = pathname.match(/\/palettes\/([^/]+)/);
  const activeTag = tagMatch ? tagMatch[1] : null;
  const isHome = !activeTag && !pathname.includes("/collections");

  return (
    <aside className="w-[150px] shrink-0 hidden md:block">
      <nav className="sticky top-[76px]">
        <div className="space-y-[2px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isHome && current === item.key;
            const href = item.href
              ? `/${locale}${item.href}`
              : `/${locale}?sort=${item.key}`;

            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-1 py-[10px] text-[15px] transition-colors",
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 pt-2 border-t border-gray-100/80">
          <div className="space-y-[1px]">
            {tags.map((tag) => {
              const isActive = activeTag === tag.toLowerCase();
              return (
                <Link
                  key={tag}
                  href={`/${locale}/palettes/${tag.toLowerCase()}`}
                  className={cn(
                    "block px-1 py-[5px] text-[14px] transition-colors",
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
