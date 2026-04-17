"use client";

import { LikeButton } from "./like-button";
import { SaveButton } from "./save-button";
import { useCopyColor } from "@/hooks/use-copy-color";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

interface PaletteCardProps {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
  liked?: boolean;
  initialSaved?: boolean;
  timeAgo?: string;
}

export function PaletteCard({ id, slug, colors, likesCount, liked, initialSaved, timeAgo }: PaletteCardProps) {
  const { copy } = useCopyColor();
  const { locale } = useLocale();

  return (
    <div className="item">
      <Link
        href={`/${locale}/palette/${slug}`}
        className="block active:scale-[0.97] transition-transform duration-100"
        onClick={() => { try { navigator.vibrate?.(8); } catch {} }}
      >
        <div
          className="palette"
          style={{ boxShadow: "0 10px 20px 0 rgba(0,0,0,0.05)" }}
        >
          <div className="absolute inset-0 flex flex-col">
            {colors.map((color, i) => {
              const heights = ["41%", "26%", "18%", "15%"];
              return (
              <div
                key={i}
                className="relative group/strip w-full"
                style={{ backgroundColor: color, height: heights[i] || "25%" }}
              >
                <span
                  className="absolute bottom-0 left-0 px-[6px] py-[3px] rounded-[0_6px_0_0] text-white text-[14px] font-mono tracking-[1px] opacity-0 group-hover/strip:opacity-100 cursor-pointer transition-opacity duration-200"
                  style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copy(color.toUpperCase(), color.toUpperCase());
                  }}
                >
                  {color.toUpperCase()}
                </span>
              </div>
              );
            })}
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
          <SaveButton paletteId={id} initialSaved={initialSaved} />
        </div>
        {timeAgo && (
          <span className="text-[12px] opacity-70 shrink-0">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
