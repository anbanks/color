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
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        "inline-flex items-center justify-center h-[38px] rounded-[10px] border text-[14px] cursor-pointer transition-all duration-200 select-none shrink-0",
        variant === "full" ? "px-[14px] gap-[6px]" : "w-[38px]",
        saved
          ? "border-[#F5B800] bg-[#FFF4B8] text-[#B47500] dark:border-[#FFD400] dark:bg-[#FFD400]/15 dark:text-[#FFD400]"
          : "border-[#ececec] dark:border-white/15 text-black/90 dark:text-white/80 hover:text-black dark:hover:text-white"
      )}
    >
      <Bookmark
        className={cn("h-[17px] w-[17px] transition-all", saved && "fill-current drop-shadow-[0_0_2px_rgba(255,212,0,0.45)]")}
        strokeWidth={saved ? 2.5 : 1.5}
      />
      {variant === "full" && <span>{t.collections.saveToCollection}</span>}
    </button>
  );
}
