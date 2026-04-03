"use client";

import { LikeButton } from "./like-button";
import { useCopyColor } from "@/hooks/use-copy-color";
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

  return (
    <div className="w-full">
      <Link href={`/${locale}/palette/${slug}`} className="block">
        <div className="overflow-hidden cursor-pointer border border-gray-200/60 rounded-[4px] hover:border-gray-300/80 transition-all duration-150">
          {colors.map((color, i) => (
            <div
              key={i}
              className="h-[80px] relative group/strip"
              style={{ backgroundColor: color }}
            >
              <div className="absolute bottom-0 left-0 right-0 px-[10px] py-[6px] opacity-0 group-hover/strip:opacity-100 transition-opacity duration-150">
                <span
                  className="inline-block px-[8px] py-[3px] rounded-[4px] bg-black/50 text-white text-[11px] font-mono font-medium tracking-wide backdrop-blur-sm cursor-copy"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copy(color.toUpperCase(), color.toUpperCase());
                  }}
                >
                  {color.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Link>
      <div className="flex items-center justify-between mt-[10px]">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-[13px] text-gray-400">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
