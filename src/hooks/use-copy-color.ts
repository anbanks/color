"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/gtag";

export function useCopyColor() {
  const copy = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label || text}`, { duration: 1500 });
      const isSingleHex = /^#?[0-9a-f]{3,8}$/i.test(text.trim());
      if (isSingleHex) {
        trackEvent("color_copy", { hex: text.trim() });
      } else {
        trackEvent("palette_copy_all", { value: text.slice(0, 200) });
      }
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  return { copy };
}
