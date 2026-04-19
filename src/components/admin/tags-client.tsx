"use client";

import { useState } from "react";
import { COLOR_SLUGS, TAG_SLUGS } from "@/lib/tag-labels";
import { cn } from "@/lib/utils";

interface TagsClientProps {
  published: Record<string, number>;
  queued: Record<string, number>;
}

const TAG_COLORS: Record<string, string> = {
  Blue: "#5B9BD5", Teal: "#2BBBB0", Mint: "#7DDDB3", Green: "#5CB85C",
  Sage: "#9CAF88", Yellow: "#F0D264", Beige: "#E8D8B8", Brown: "#8B6914",
  Orange: "#D4922A", Peach: "#E8927C", Red: "#E8524A", Maroon: "#800000",
  Pink: "#E88CB4", Purple: "#B47CC7", Navy: "#2C3E7B", Black: "#333333",
  Grey: "#CCCCCC", White: "#F5F5F0",
};

type Filter = "all" | "colors" | "collections";

export function TagsClient({ published, queued }: TagsClientProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const colorSlugs = COLOR_SLUGS as readonly string[];
  const tagSlugs = TAG_SLUGS as readonly string[];

  const allTags = (() => {
    if (filter === "colors") return [...colorSlugs];
    if (filter === "collections") return [...tagSlugs];
    return [...colorSlugs, ...tagSlugs];
  })();

  const sorted = allTags
    .map((tag) => ({
      tag,
      type: colorSlugs.includes(tag) ? "color" as const : "collection" as const,
      published: published[tag] || 0,
      queued: queued[tag] || 0,
      total: (published[tag] || 0) + (queued[tag] || 0),
    }))
    .sort((a, b) => b.total - a.total);

  const totalPublished = Object.values(published).reduce((a, b) => a + b, 0);
  const totalQueued = Object.values(queued).reduce((a, b) => a + b, 0);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `All ${sorted.length}` },
    { key: "colors", label: `Colors ${colorSlugs.length}` },
    { key: "collections", label: `Collections ${tagSlugs.length}` },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors cursor-pointer",
              filter === f.key
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-[#ffffff] dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200/60 dark:border-white/[0.06]">
              <th className="text-left px-4 py-3 text-gray-500 dark:text-white/40 font-medium">Tag</th>
              <th className="text-left px-4 py-3 text-gray-500 dark:text-white/40 font-medium">Type</th>
              <th className="text-right px-4 py-3 text-gray-500 dark:text-white/40 font-medium">Published</th>
              <th className="text-right px-4 py-3 text-gray-500 dark:text-white/40 font-medium">In Queue</th>
              <th className="text-right px-4 py-3 text-gray-500 dark:text-white/40 font-medium">Total</th>
              <th className="px-4 py-3 text-gray-500 dark:text-white/40 font-medium w-[200px]">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const maxTotal = sorted[0]?.total || 1;
              const pct = Math.round((row.total / maxTotal) * 100);
              return (
                <tr key={row.tag} className="border-b border-gray-100 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-white/85">
                    <span className="inline-flex items-center gap-2">
                      {row.type === "color" && (
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/[0.06]"
                          style={{ backgroundColor: TAG_COLORS[row.tag] || "#999" }}
                        />
                      )}
                      {row.tag}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full",
                      row.type === "color"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                    )}>
                      {row.type === "color" ? "Color" : "Collection"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700 dark:text-white/70 tabular-nums">
                    {row.published}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 dark:text-white/50 tabular-nums">
                    {row.queued}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-800 dark:text-white/85 tabular-nums">
                    {row.total}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-900 dark:bg-white/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-white/35 tabular-nums w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
