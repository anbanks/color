"use client";

import { LikeButton } from "./like-button";
import { useCopyColor } from "@/hooks/use-copy-color";
import { getContrastColor } from "@/lib/color-utils";
import { useLocale } from "@/lib/locale-context";
import { useRouter } from "next/navigation";
import { useRef } from "react";

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
  const router = useRouter();
  const didCopy = useRef(false);

  const handleCardClick = () => {
    // Se acabou de copiar uma cor, não navega
    if (didCopy.current) {
      didCopy.current = false;
      return;
    }
    router.push(`/${locale}/palette/${slug}`);
  };

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    didCopy.current = true;
    copy(color.toUpperCase(), color.toUpperCase());
  };

  return (
    <div className="w-full max-w-[280px]">
      <div
        className="rounded-[8px] overflow-hidden cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-200"
        onClick={handleCardClick}
      >
        {colors.map((color, i) => {
          const textColor = getContrastColor(color);
          return (
            <div
              key={i}
              className="h-[75px] relative group/strip"
              style={{ backgroundColor: color }}
              onClick={(e) => handleColorClick(e, color)}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity">
                <span
                  className="text-[11px] font-mono font-medium tracking-[0.08em]"
                  style={{ color: textColor === "white" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.45)" }}
                >
                  {color.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-[10px] px-[2px]">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-[12px] text-gray-400">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
