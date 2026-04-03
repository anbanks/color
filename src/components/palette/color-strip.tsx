"use client";

import { useState } from "react";
import { useCopyColor } from "@/hooks/use-copy-color";
import { getContrastColor } from "@/lib/color-utils";
import { cn } from "@/lib/utils";

interface ColorStripProps {
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ColorStrip({ color, isFirst, isLast }: ColorStripProps) {
  const [hovered, setHovered] = useState(false);
  const { copy } = useCopyColor();
  const textColor = getContrastColor(color);

  return (
    <div
      className={cn(
        "h-16 relative cursor-pointer transition-all",
        isFirst && "rounded-t-xl",
        isLast && "rounded-b-xl"
      )}
      style={{ backgroundColor: color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
    >
      {hovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span
            className={cn(
              "text-sm font-mono font-medium tracking-wide",
              textColor === "white" ? "text-white" : "text-gray-900"
            )}
          >
            {color.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
