"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Sparkles, Flame, Orbit, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "", label: "New", icon: Sparkles },
  { path: "/popular", label: "Popular", icon: Flame },
  { path: "/random", label: "Random", icon: Orbit },
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
    <nav>
      <div className="space-y-[1px]">
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
                "flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] text-[16px] transition-all duration-150",
                isActive
                  ? "text-gray-900 font-semibold bg-gray-100/80"
                  : "text-gray-800 hover:bg-gray-100/60"
              )}
            >
              <Icon
                className={cn(
                  "w-[22px] h-[22px]",
                  isActive ? "text-gray-900" : "text-gray-500"
                )}
                strokeWidth={isActive ? 2.2 : 1.5}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 ml-[12px] pt-3 border-t border-gray-100">
        <div className="space-y-[1px]">
          {tags.map((tag) => {
            const isActive = activeTag === tag.toLowerCase();
            return (
              <Link
                key={tag}
                href={`/${locale}/palettes/${tag.toLowerCase()}`}
                className={cn(
                  "block py-[6px] text-[15px] transition-colors",
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
