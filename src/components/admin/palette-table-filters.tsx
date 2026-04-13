"use client";

import { useState } from "react";
import { PaletteTable } from "./palette-table";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

interface PaletteRow {
  id: string;
  slug: string;
  colors: string[];
  status: string;
  likesCount: number;
  createdAt: string;
}

interface Props {
  palettes: PaletteRow[];
  counts: Record<string, number>;
}

export function PaletteTableWithFilters({ palettes, counts }: Props) {
  const [active, setActive] = useState("all");
  const { t } = useLocale();

  const filters = [
    { key: "all", label: t.admin.all },
    { key: "published", label: t.admin.published },
    { key: "pending", label: t.admin.pending },
    { key: "rejected", label: t.admin.rejected },
  ];

  const filtered = active === "all"
    ? palettes
    : palettes.filter((p) => p.status === active);

  return (
    <div>
      <div className="flex items-center gap-1 mb-5">
        {filters.map((f) => {
          const count = counts[f.key] || 0;
          const isActive = active === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
              )}
            >
              {f.label}
              <span className={cn(
                "ml-1.5 text-[11px]",
                isActive ? "text-gray-500 dark:text-white/60" : "text-gray-400 dark:text-white/25"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <PaletteTable palettes={filtered} />
    </div>
  );
}
