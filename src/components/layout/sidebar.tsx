"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Sparkles, Flame, Orbit, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "", key: "new" as const, icon: Sparkles },
  { path: "/popular", key: "popular" as const, icon: Flame },
  { path: "/random", key: "random" as const, icon: Orbit },
  { path: "/collections", key: "collection" as const, icon: Bookmark },
];

const navLabels: Record<string, Record<string, string>> = {
  en: { new: "New", popular: "Popular", random: "Random", collection: "Collection" },
  pt: { new: "Novas", popular: "Populares", random: "Aleatórias", collection: "Coleção" },
  es: { new: "Nuevas", popular: "Populares", random: "Aleatorias", collection: "Colección" },
  fr: { new: "Nouveautés", popular: "Populaires", random: "Aléatoire", collection: "Collection" },
  de: { new: "Neu", popular: "Beliebt", random: "Zufällig", collection: "Sammlung" },
  it: { new: "Nuove", popular: "Popolari", random: "Casuali", collection: "Collezione" },
  ja: { new: "新着", popular: "人気", random: "ランダム", collection: "コレクション" },
  zh: { new: "最新", popular: "流行", random: "随机", collection: "收藏" },
};

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
      <div>
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
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-[4px] h-[42px] text-[17px] rounded-[10px] px-[14px] mb-[6px] transition-all duration-200 cursor-pointer relative overflow-hidden",
                isActive
                  ? "font-medium text-black dark:text-white bg-[#F0F0F0] dark:bg-[#2a2a2a]"
                  : "opacity-80 text-black/90 dark:text-white/80 hover:opacity-100"
              )}
            >
              <Icon
                className="w-[20px] h-[20px] -ml-[2px] mr-[2px] shrink-0"
                strokeWidth={isActive ? 2 : 1.5}
              />
              {navLabels[locale]?.[item.key] || item.key}
            </Link>
          );
        })}
      </div>

      <div className="mt-[10px]">
        {tags.map((tag, i) => {
          const isActive = activeTag === tag.toLowerCase();
          return (
            <Link
              key={tag}
              href={`/${locale}/palettes/${tag.toLowerCase()}`}
              className={cn(
                "flex items-center h-[36px] text-[14px] rounded-[10px] pl-[16px] transition-all duration-200 cursor-pointer",
                isActive
                  ? "font-medium text-black dark:text-white bg-[#F0F0F0] dark:bg-[#2a2a2a]"
                  : "text-black/90 dark:text-white/80 hover:opacity-80"
              )}
              style={{
                opacity: isActive ? 1 : Math.max(0.1, 0.8 - (i * 0.05)),
              }}
            >
              {tag}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
