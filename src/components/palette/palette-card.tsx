"use client";

import { LikeButton } from "./like-button";
import { useState } from "react";
import { useCopyColor } from "@/hooks/use-copy-color";
import { getContrastColor } from "@/lib/color-utils";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

interface PaletteCardProps {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  liked?: boolean;
  timeAgo?: string;
}

export function PaletteCard({ id, slug, colors, likesCount, liked, timeAgo }: PaletteCardProps) {
  const { copy } = useCopyColor();
  const { locale } = useLocale();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      <Link href={`/${locale}/palette/${slug}`} className="block">
        <div className="rounded-[10px] overflow-hidden cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow duration-200">
          {colors.map((color, i) => {
            const textColor = getContrastColor(color);
            return (
              <div
                key={i}
                className="h-[82px] relative"
                style={{ backgroundColor: color }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copy(color.toUpperCase(), color.toUpperCase());
                }}
              >
                {hoveredIndex === i && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04]">
                    <span
                      className="text-[12px] font-mono font-medium tracking-[0.08em]"
                      style={{ color: textColor === "white" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.45)" }}
                    >
                      {color.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Link>
      <div className="flex items-center justify-between mt-[10px] px-[2px]">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-[12px] text-gray-400 font-normal">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
