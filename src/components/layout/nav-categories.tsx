"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = [
  { label: "Trending", value: "trending" },
  { label: "Popular", value: "popular" },
  { label: "New", value: "new" },
  { label: "Random", value: "random" },
];

export function NavCategories() {
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "trending";

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={`/?sort=${cat.value}`}
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
