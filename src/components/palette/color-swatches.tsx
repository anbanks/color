"use client";

import { useCopyColor } from "@/hooks/use-copy-color";
import { formatRgb } from "@/lib/color-utils";

interface ColorSwatchesProps {
  colors: string[];
}

export function ColorSwatches({ colors }: ColorSwatchesProps) {
  const { copy } = useCopyColor();

  return (
    <div className="flex items-start justify-center gap-8 mt-8">
      {colors.map((color, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <button
            className="w-12 h-12 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
            title={color.toUpperCase()}
          />
          <button
            className="text-[13px] font-mono text-gray-700 dark:text-white/80 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
            onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
          >
            {color.toUpperCase()}
          </button>
          <button
            className="text-[11px] font-mono text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer transition-colors"
            onClick={() => copy(formatRgb(color), formatRgb(color))}
          >
            {formatRgb(color)}
          </button>
        </div>
      ))}
    </div>
  );
}
