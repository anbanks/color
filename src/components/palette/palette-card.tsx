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
        <div className="aspect-square overflow-hidden cursor-pointer rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200 flex flex-col">
          {colors.map((color, i) => (
            <div
              key={i}
              className="flex-1 relative group/strip"
              style={{ backgroundColor: color }}
            >
              <div className="absolute bottom-[4px] left-[6px] opacity-0 group-hover/strip:opacity-100 transition-opacity duration-150">
                <span
                  className="inline-block px-[6px] py-[2px] rounded-[3px] bg-black/40 text-white/90 text-[11px] font-mono font-medium tracking-wide cursor-copy"
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
