"use client";

import { useState } from "react";
import { useCopyColor } from "@/hooks/use-copy-color";
import { getContrastColor, formatRgb, formatHsl } from "@/lib/color-utils";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Format = "hex" | "rgb" | "hsl";

interface PaletteDetailProps {
  colors: string[];
}

export function PaletteDetail({ colors }: PaletteDetailProps) {
  const [format, setFormat] = useState<Format>("hex");
  const { copy } = useCopyColor();

  const getFormatted = (color: string) => {
    switch (format) {
      case "rgb":
        return formatRgb(color);
      case "hsl":
        return formatHsl(color);
      default:
        return color.toUpperCase();
    }
  };

  return (
    <div>
      {/* Format toggle */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {(["hex", "rgb", "hsl"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full uppercase transition-colors",
              format === f
                ? "bg-gray-900 text-white"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Color strips */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        {colors.map((color, i) => {
          const textColor = getContrastColor(color);
          const formatted = getFormatted(color);

          return (
            <div
              key={color + i}
              className="h-24 sm:h-28 flex items-center justify-between px-6 cursor-pointer group transition-all hover:brightness-95"
              style={{ backgroundColor: color }}
              onClick={() => copy(formatted, formatted)}
            >
              <span
                className={cn(
                  "font-mono text-sm sm:text-base font-medium tracking-wide",
                  textColor === "white" ? "text-white" : "text-gray-900"
                )}
              >
                {formatted}
              </span>
              <Copy
                className={cn(
                  "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                  textColor === "white" ? "text-white/70" : "text-gray-900/40"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
