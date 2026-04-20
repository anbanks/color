"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { useLocalePath } from "@/hooks/use-locale-path";
import { COLOR_SLUGS, TAG_SLUGS, colorLabel, tagLabel } from "@/lib/tag-labels";

interface PaletteTagsProps {
  tags: string[];
}

const colorSet = new Set<string>(COLOR_SLUGS);
const collectionSet = new Set<string>(TAG_SLUGS);

export function PaletteTags({ tags }: PaletteTagsProps) {
  const { locale } = useLocale();
  const lp = useLocalePath();
  if (!tags.length) return null;

  const colorTags = tags.filter((t) => colorSet.has(t));
  const collTags = tags.filter((t) => collectionSet.has(t));

  return (
    <div className="mt-6 space-y-2">
      {colorTags.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35 mb-1.5 block">Colors</span>
          <div className="flex flex-wrap gap-1.5">
            {colorTags.map((tag) => (
              <Link
                key={tag}
                href={lp(`/palettes/${tag.toLowerCase()}`)}
                className="inline-flex items-center gap-1.5 px-3 py-[5px] text-[12px] font-medium rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
              >
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0 border border-black/[0.06]"
                  style={{ backgroundColor: getTagColor(tag) }}
                />
                {colorLabel(tag, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
      {collTags.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35 mb-1.5 block">Collections</span>
          <div className="flex flex-wrap gap-1.5">
            {collTags.map((tag) => (
              <Link
                key={tag}
                href={lp(`/palettes/${tag.toLowerCase()}`)}
                className="px-3 py-[5px] text-[12px] font-medium rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
              >
                {tagLabel(tag, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  Blue: "#5B9BD5", Teal: "#2BBBB0", Mint: "#7DDDB3", Green: "#5CB85C",
  Sage: "#9CAF88", Yellow: "#F0D264", Beige: "#E8D8B8", Brown: "#8B6914",
  Orange: "#D4922A", Peach: "#E8927C", Red: "#E8524A", Maroon: "#800000",
  Pink: "#E88CB4", Purple: "#B47CC7", Navy: "#2C3E7B", Black: "#333333",
  Grey: "#CCCCCC", White: "#F5F5F0",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "#999";
}
