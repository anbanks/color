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

// Color Hunt: .palette { padding-bottom:100%; border-radius:10px; position:relative; overflow:hidden; margin-bottom:14px }
// Color Hunt: .place { position:absolute; width:100%; }
// Color Hunt: .c0 { padding-bottom:41% } .c1 { padding-bottom:67% } .c2 { padding-bottom:85% } .c3 { padding-bottom:100% }

export function PaletteCard({ id, slug, colors, likesCount, liked, timeAgo }: PaletteCardProps) {
  const { copy } = useCopyColor();
  const { locale } = useLocale();

  // Posições absolutas das 4 faixas (como no Color Hunt)
  const positions = [
    { top: "0%", height: "41%" },       // c0: 0 → 41%
    { top: "41%", height: "26%" },      // c1: 41% → 67%
    { top: "67%", height: "18%" },      // c2: 67% → 85%
    { top: "85%", height: "15%" },      // c3: 85% → 100%
  ];

  return (
    <div>
      <Link href={`/${locale}/palette/${slug}`} className="block">
        <div
          className="w-full relative overflow-hidden rounded-[10px] cursor-pointer"
          style={{ paddingBottom: "100%", boxShadow: "0 10px 20px 0 rgba(0,0,0,0.05)" }}
        >
          {colors.map((color, i) => {
            const pos = positions[i] || positions[3];
            return (
              <div
                key={i}
                className="absolute w-full group/strip"
                style={{
                  backgroundColor: color,
                  top: pos.top,
                  height: pos.height,
                }}
              >
                {/* HEX tooltip — bottom-left como Color Hunt */}
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
      </Link>
      <div className="flex items-center justify-between mt-0 relative w-full">
        <LikeButton paletteId={id} initialCount={likesCount} initialLiked={liked} />
        {timeAgo && (
          <span className="text-[12px] opacity-70 shrink-0">{timeAgo}</span>
        )}
      </div>
    </div>
  );
}
