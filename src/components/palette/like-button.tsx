"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
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
        "inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full border text-[13px] transition-all duration-200",
        liked
          ? "border-red-200 bg-red-50/50 text-red-500"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      )}
    >
      <Heart
        className={cn(
          "h-[14px] w-[14px] transition-all duration-200",
          liked && "fill-current scale-110"
        )}
      />
      <span className="font-medium tabular-nums">{formatted}</span>
    </button>
  );
}
