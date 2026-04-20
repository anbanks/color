"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Sparkles, Flame, Orbit, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalePath } from "@/hooks/use-locale-path";

const items = [
  { path: "", key: "new" as const, icon: Sparkles },
  { path: "/popular", key: "popular" as const, icon: Flame },
  { path: "/random", key: "random" as const, icon: Orbit },
  { path: "/collections", key: "collection" as const, icon: Bookmark },
];

const labels: Record<string, Record<string, string>> = {
  en: { new: "New", popular: "Popular", random: "Random", collection: "Collection" },
  pt: { new: "Novas", popular: "Populares", random: "Aleatórias", collection: "Coleção" },
  es: { new: "Nuevas", popular: "Populares", random: "Aleatorias", collection: "Colección" },
  fr: { new: "Nouveau", popular: "Populaire", random: "Aléatoire", collection: "Collection" },
  de: { new: "Neu", popular: "Beliebt", random: "Zufällig", collection: "Sammlung" },
  it: { new: "Nuove", popular: "Popolari", random: "Casuali", collection: "Collezione" },
  ja: { new: "新着", popular: "人気", random: "ランダム", collection: "コレクション" },
  zh: { new: "最新", popular: "流行", random: "随机", collection: "收藏" },
  hi: { new: "नया", popular: "लोकप्रिय", random: "यादृच्छिक", collection: "संग्रह" },
};

export function MobileTabs() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const lp = useLocalePath();
  const base = lp("/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur border-t border-gray-200/70 dark:border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around h-[62px]">
        {items.map((item) => {
          const Icon = item.icon;
          const href = lp(item.path || "/");
          const isActive =
            item.path === ""
              ? pathname === base || pathname === base + "/" || pathname === lp("/new")
              : item.path === "/collections"
              ? pathname.startsWith(lp("/collections"))
              : pathname.startsWith(href);
          const label = labels[locale]?.[item.key] ?? item.key;

          return (
            <li key={item.key} className="flex-1">
              <Link
                href={href}
                onClick={() => {
                  try { navigator.vibrate?.(8); } catch {}
                }}
                className={cn(
                  "h-full flex flex-col items-center justify-center gap-[3px] text-[11px] transition-colors active:scale-90 transition-transform duration-100",
                  isActive
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-500 dark:text-white/55 hover:text-gray-800 dark:hover:text-white/85"
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2 : 1.6} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
