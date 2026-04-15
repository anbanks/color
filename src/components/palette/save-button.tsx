"use client";

import { useRef, useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface SaveButtonProps {
  paletteId: string;
  initialSaved?: boolean;
  variant?: "compact" | "full";
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

const FILL_SWEEP: Keyframe[] = [
  { clipPath: "inset(100% 0 0 0)" },
  { clipPath: "inset(0 0 0 0)" },
];
const FILL_OPTS: KeyframeAnimationOptions = {
  duration: 320,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  fill: "both",
};

export function SaveButton({ paletteId, initialSaved = false, variant = "compact" }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const iconRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGSVGElement>(null);
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    iconRef.current?.animate(ICON_POP, ICON_OPTS);
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paletteId }),
        });
        if (!res.ok) {
          if (res.status === 401) {
            toast.error(t.auth.signIn);
          }
          return;
        }
        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
        if (data.saved) {
          fillRef.current?.animate(FILL_SWEEP, FILL_OPTS);
        }
      } catch {
        // silently fail
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={t.collections.saveToCollection}
      className={cn(
        "inline-flex items-center justify-center h-[38px] rounded-[10px] border text-[14px] cursor-pointer select-none shrink-0",
        "transition-[color,border-color,background] duration-150 ease-out active:scale-[0.96]",
        variant === "full" ? "px-[14px] gap-[6px]" : "w-[38px]",
        saved
          ? "border-gray-200 bg-gray-100 text-gray-700 dark:border-white/15 dark:bg-white/10 dark:text-white/85"
          : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/25"
      )}
    >
      <span className="relative inline-flex h-[17px] w-[17px]">
        <Bookmark
          ref={iconRef}
          className="absolute inset-0 h-[17px] w-[17px] transition-colors will-change-transform"
          strokeWidth={saved ? 2.2 : 1.5}
        />
        {saved && (
          <Bookmark
            ref={fillRef}
            className="absolute inset-0 h-[17px] w-[17px] fill-current pointer-events-none"
            strokeWidth={2.2}
          />
        )}
      </span>
      {variant === "full" && <span>{t.collections.saveToCollection}</span>}
    </button>
  );
}
