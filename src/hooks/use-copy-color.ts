"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export function useCopyColor() {
  const copy = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label || text}`, { duration: 1500 });
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  return { copy };
}
