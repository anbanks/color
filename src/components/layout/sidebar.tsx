"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Shuffle, Heart } from "lucide-react";

const navItems = [
  { key: "new", icon: Sparkles },
  { key: "popular", icon: Clock },
  { key: "random", icon: Shuffle },
  { key: "collection", icon: Heart },
];

const tags = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Sunset",
];

export function Sidebar() {
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "new";
  const currentTag = searchParams.get("tag") || "";
  const { locale } = useLocale();

  return (
    <aside className="w-40 shrink-0 hidden md:block">
      <nav className="sticky top-16 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.key && !currentTag;
          return (
            <Link
              key={item.key}
              href={`/${locale}?sort=${item.key}`}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 text-sm rounded-lg transition-colors",
                isActive
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="capitalize">{item.key}</span>
            </Link>
          );
        })}

        <div className="pt-4 space-y-0.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/${locale}/palettes/${tag.toLowerCase()}`}
              className={cn(
                "block px-2 py-1 text-sm transition-colors",
                currentTag === tag.toLowerCase()
                  ? "text-gray-900 font-medium"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tag}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
