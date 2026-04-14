"use client";

import { useRef, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  paletteId: string;
  initialCount: number;
  initialLiked?: boolean;
}

export function LikeButton({ paletteId, initialCount, initialLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const iconRef = useRef<SVGSVGElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    const el = iconRef.current;
    if (el) {
      el.classList.remove("animate-save-pop");
      void el.getBoundingClientRect();
      el.classList.add("animate-save-pop");
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/palettes/${paletteId}/like`, { method: "POST" });
        if (res.ok) {
          const data = (await res.json()) as { liked: boolean; count: number };
          setLiked(data.liked);
          setCount(data.count);
        }
      } catch {
        // silently fail
      }
    });
  };

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toLocaleString();

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(); }}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-[6px] h-[38px] px-[14px] rounded-[10px] border text-[14px] cursor-pointer relative overflow-hidden select-none shrink-0",
        "transition-all duration-150 ease-out active:scale-[0.92]",
        liked
          ? "border-transparent text-red-500"
          : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/25"
      )}
      style={liked ? { background: "linear-gradient(90deg, #FFF0F0 0%, #FFE8E8 100%)" } : {}}
    >
      <Heart
        ref={iconRef}
        className={cn("h-[16px] w-[16px] -ml-[4px] transition-colors", liked && "fill-current")}
        strokeWidth={liked ? 2 : 1.5}
      />
      <span className="font-normal tabular-nums">{formatted}</span>
    </button>
  );
}
