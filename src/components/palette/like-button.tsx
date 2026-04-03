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
        const res = await fetch(`/api/palettes/${paletteId}/like`, {
          method: "POST",
        });
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

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1 text-sm transition-colors",
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-all", liked && "fill-current scale-110")}
      />
      <span className="font-medium">{count}</span>
    </button>
  );
}
