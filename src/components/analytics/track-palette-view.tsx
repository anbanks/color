"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/gtag";

export function TrackPaletteView({
  paletteId,
  colors,
}: {
  paletteId: string;
  colors: string[];
}) {
  useEffect(() => {
    trackEvent("palette_view", { palette_id: paletteId, colors_count: colors.length });
  }, [paletteId, colors.length]);

  return null;
}
