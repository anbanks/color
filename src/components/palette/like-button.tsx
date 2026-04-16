"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface LikeButtonProps {
  paletteId: string;
  initialCount: number;
  initialLiked?: boolean;
}

const ICON_POP: Keyframe[] = [
  { transform: "translateY(0) scale(1)" },
  { transform: "translateY(-1px) scale(0.82)", offset: 0.25 },
  { transform: "translateY(-2px) scale(1.18)", offset: 0.55 },
  { transform: "translateY(0) scale(1)" },
];
const ICON_OPTS: KeyframeAnimationOptions = {
  duration: 260,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : n.toLocaleString();
}

export function LikeButton({ paletteId, initialCount, initialLiked = false }: LikeButtonProps) {
  const { t } = useLocale();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const iconRef = useRef<SVGSVGElement>(null);
  const newCountRef = useRef<HTMLSpanElement>(null);
  const oldCountRef = useRef<HTMLSpanElement>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (prev === null) return;
    newCountRef.current?.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
    const out = oldCountRef.current?.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(-100%)", opacity: 0 },
      ],
      { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
    const done = () => setPrev(null);
    out?.addEventListener("finish", done);
    return () => out?.removeEventListener("finish", done);
  }, [prev]);

  const handleLike = () => {
    iconRef.current?.animate(ICON_POP, ICON_OPTS);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/palettes/${paletteId}/like`, { method: "POST" });
        if (!res.ok) {
          if (res.status === 401) toast.error(t.auth.signIn);
          return;
        }
        const data = (await res.json()) as { liked: boolean; count: number };
        setLiked(data.liked);
        if (data.count !== count) {
          setPrev(count);
          setCount(data.count);
        }
      } catch {
        // silently fail
      }
    });
  };

  const current = formatCount(count);
  const old = prev !== null ? formatCount(prev) : null;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(); }}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-[6px] h-[38px] px-[14px] rounded-[10px] border text-[14px] cursor-pointer relative select-none shrink-0",
        "transition-[color,border-color,background] duration-150 ease-out active:scale-[0.96]",
        liked
          ? "border-transparent text-red-500"
          : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/25"
      )}
      style={liked ? { background: "linear-gradient(90deg, #FFF0F0 0%, #FFE8E8 100%)" } : {}}
    >
      <Heart
        ref={iconRef}
        className={cn("h-[16px] w-[16px] -ml-[4px] transition-colors will-change-transform", liked && "fill-current")}
        strokeWidth={liked ? 2 : 1.5}
      />
      <span className="relative inline-block overflow-hidden font-normal tabular-nums leading-none h-[1em]">
        <span className="invisible">{current}</span>
        <span ref={newCountRef} className="absolute inset-0">{current}</span>
        {old !== null && (
          <span ref={oldCountRef} className="absolute inset-0">{old}</span>
        )}
      </span>
    </button>
  );
}
