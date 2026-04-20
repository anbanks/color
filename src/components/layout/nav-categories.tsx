"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useLocalePath } from "@/hooks/use-locale-path";
import { cn } from "@/lib/utils";

export function NavCategories() {
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "trending";
  const { t } = useLocale();
  const lp = useLocalePath();

  const categories = [
    { label: t.nav.trending, value: "trending" },
    { label: t.nav.popular, value: "popular" },
    { label: t.nav.new, value: "new" },
    { label: t.nav.random, value: "random" },
  ];

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={`${lp("/")}?sort=${cat.value}`}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full transition-colors",
            current === cat.value
              ? "bg-gray-100 text-gray-900 font-medium"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          {cat.label}
        </Link>
      ))}
    </nav>
  );
}
