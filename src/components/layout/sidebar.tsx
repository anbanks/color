"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "", label: "New", icon: "auto_awesome" },
  { path: "/popular", label: "Popular", icon: "schedule" },
  { path: "/random", label: "Random", icon: "shuffle" },
  { path: "/collections", label: "Collection", icon: "favorite" },
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
      <div className="space-y-[2px]">
        {navItems.map((item) => {
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
              <MaterialIcon
                name={item.icon}
                size={22}
                weight={isActive ? 400 : 300}
                filled={isActive}
              />
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
  );
}
