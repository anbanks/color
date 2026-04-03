"use client";

import { LikeButton } from "./like-button";
import { useState } from "react";
import { useCopyColor } from "@/hooks/use-copy-color";
import { getContrastColor } from "@/lib/color-utils";

interface PaletteCardProps {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  liked?: boolean;
  timeAgo?: string;
  onExpand?: (id: string) => void;
}

export function PaletteCard({ id, colors, likesCount, liked, timeAgo, onExpand }: PaletteCardProps) {
  const { copy } = useCopyColor();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      <div
        className="rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        onClick={() => onExpand?.(id)}
      >
        {colors.map((color, i) => {
          const textColor = getContrastColor(color);
          return (
            <div
              key={i}
              className="h-[72px] relative transition-all"
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                copy(color.toUpperCase(), color.toUpperCase());
              }}
            >
              {hoveredIndex === i && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-xs font-mono tracking-wider"
                    style={{ color: textColor === "white" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)" }}
                  >
                    {color.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-xs text-gray-400">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
