"use client";

import { useEffect, useState, useCallback } from "react";
import { useCopyColor } from "./use-copy-color";

interface UseKeyboardNavOptions {
  palettes: { id: string; colors: string[] }[];
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function useKeyboardNav({ palettes, onLike, onSave }: UseKeyboardNavOptions) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { copy } = useCopyColor();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const palette = selectedIndex >= 0 ? palettes[selectedIndex] : null;

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, palettes.length - 1));
          break;

        case "ArrowUp":
        case "k":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Escape":
          setSelectedIndex(-1);
          break;

        case "c":
          if (palette) {
            copy(palette.colors.join(", "), "all colors");
          }
          break;

        case "1":
        case "2":
        case "3":
        case "4": {
          const idx = parseInt(e.key) - 1;
          if (palette && palette.colors[idx]) {
            copy(palette.colors[idx].toUpperCase(), palette.colors[idx].toUpperCase());
          }
          break;
        }

        case "l":
          if (palette && onLike) {
            onLike(palette.id);
          }
          break;

        case "s":
          if (palette && onSave) {
            onSave(palette.id);
          }
          break;

        case " ":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev + 1;
            return next >= palettes.length ? 0 : next;
          });
          break;
      }
    },
    [palettes, selectedIndex, copy, onLike, onSave]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
}
