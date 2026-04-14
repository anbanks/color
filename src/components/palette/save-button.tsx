"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface SaveButtonProps {
  paletteId: string;
  initialSaved?: boolean;
  variant?: "compact" | "full";
}

export function SaveButton({ paletteId, initialSaved = false, variant = "compact" }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pulse, setPulse] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPulse((n) => n + 1);
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
        "transition-all duration-150 ease-out active:scale-[0.92]",
        variant === "full" ? "px-[14px] gap-[6px]" : "w-[38px]",
        saved
          ? "border-gray-200 bg-gray-100 text-gray-700 dark:border-white/15 dark:bg-white/10 dark:text-white/85"
          : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/25"
      )}
    >
      <Bookmark
        key={pulse}
        className={cn(
          "h-[17px] w-[17px] transition-all",
          saved && "fill-current",
          pulse > 0 && "animate-save-pop"
        )}
        strokeWidth={saved ? 2.2 : 1.5}
      />
      {variant === "full" && <span>{t.collections.saveToCollection}</span>}
    </button>
  );
}
