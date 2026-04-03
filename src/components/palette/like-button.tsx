"use client";

import { useState, useTransition } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
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
        "inline-flex items-center gap-[5px] px-[10px] py-[5px] rounded-full border text-[13px] transition-all duration-200",
        liked
          ? "border-red-200 bg-red-50/50 text-red-500"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      )}
    >
      <MaterialIcon
        name="favorite"
        size={16}
        weight={liked ? 400 : 300}
        filled={liked}
        className={cn("transition-all duration-200", liked && "scale-110")}
      />
      <span className="font-medium tabular-nums">{formatted}</span>
    </button>
  );
}
