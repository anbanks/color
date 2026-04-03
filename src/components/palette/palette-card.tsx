"use client";

import { LikeButton } from "./like-button";
import { useCopyColor } from "@/hooks/use-copy-color";
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
        className="overflow-hidden cursor-pointer border border-gray-200/60 rounded-[4px] hover:border-gray-300/80 transition-all duration-150"
        onClick={handleCardClick}
      >
        {colors.map((color, i) => (
          <div
            key={i}
            className="h-[80px] relative group/strip"
            style={{ backgroundColor: color }}
            onClick={(e) => handleColorClick(e, color)}
          >
            {/* HEX tooltip — bottom-left, dark bg */}
            <div className="absolute bottom-0 left-0 right-0 px-[10px] py-[6px] opacity-0 group-hover/strip:opacity-100 transition-opacity duration-150">
              <span className="inline-block px-[8px] py-[3px] rounded-[4px] bg-black/50 text-white text-[11px] font-mono font-medium tracking-wide backdrop-blur-sm">
                {color.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-[10px]">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-[13px] text-gray-400">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
