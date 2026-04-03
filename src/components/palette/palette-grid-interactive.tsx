"use client";

import { useKeyboardNav } from "@/hooks/use-keyboard-nav";
import { PaletteCard } from "./palette-card";
import { cn } from "@/lib/utils";

interface Palette {
  id: string;
  slug: string;
  colors: string[];
  likesCount: number;
}

interface PaletteGridInteractiveProps {
  palettes: Palette[];
}

export function PaletteGridInteractive({ palettes }: PaletteGridInteractiveProps) {
  const { selectedIndex } = useKeyboardNav({ palettes });

  if (palettes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No palettes yet</p>
        <p className="text-sm mt-1">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {palettes.map((palette, i) => (
          <div
            key={palette.id}
            className={cn(
              "rounded-xl transition-all",
              selectedIndex === i && "ring-2 ring-gray-300 ring-offset-2"
            )}
          >
            <PaletteCard
              id={palette.id}
              slug={palette.slug}
              colors={palette.colors}
              likesCount={palette.likesCount}
            />
          </div>
        ))}
      </div>
      {selectedIndex >= 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex gap-3">
          <span><kbd className="font-mono bg-gray-700 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-gray-700 px-1 rounded">1-4</kbd> copy color</span>
          <span><kbd className="font-mono bg-gray-700 px-1 rounded">c</kbd> copy all</span>
          <span><kbd className="font-mono bg-gray-700 px-1 rounded">esc</kbd> deselect</span>
        </div>
      )}
    </div>
  );
}
