"use client";

import { useCopyColor } from "@/hooks/use-copy-color";

interface PaletteStripsProps {
  colors: string[];
}

export function PaletteStrips({ colors }: PaletteStripsProps) {
  const { copy } = useCopyColor();

  return (
    <div className="rounded-[10px] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
      {colors.map((color, i) => (
        <div
          key={i}
          className="h-[100px] relative group/strip cursor-pointer transition-all hover:brightness-[0.97]"
          style={{ backgroundColor: color }}
          onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
        >
          <span
            className="absolute bottom-0 left-0 px-[6px] py-[3px] rounded-[0_6px_0_0] text-white text-[14px] font-mono tracking-[1px] opacity-0 group-hover/strip:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          >
            {color.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
