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
      <Link href={`/${locale}/palette/${slug}`}>
        <div className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
          {colors.map((color, i) => {
            const textColor = getContrastColor(color);
            return (
              <div
                key={i}
                className="h-[72px] relative"
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xs font-mono tracking-wider"
                      style={{ color: textColor === "white" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)" }}
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
      <div className="flex items-center justify-between mt-2 px-0.5">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-xs text-gray-400">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
