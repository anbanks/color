"use client";

import { useCopyColor } from "@/hooks/use-copy-color";
import { LikeButton } from "./like-button";
import { getContrastColor } from "@/lib/color-utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useState } from "react";

interface PaletteExpandedProps {
  palette: {
    id: string;
    slug: string;
    colors: string[];
    likesCount: number;
  };
  onClose: () => void;
}

export function PaletteExpanded({ palette, onClose }: PaletteExpandedProps) {
  const { copy } = useCopyColor();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleCopyLink = () => {
    copy(
      `${window.location.origin}/palette/${palette.slug}`,
      "Link"
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        <MaterialIcon name="arrow_back" size={18} weight={300} />
        Back
      </button>

      {/* Expanded palette */}
      <div className="rounded-xl overflow-hidden shadow-sm">
        {palette.colors.map((color, i) => {
          const textColor = getContrastColor(color);
          return (
            <div
              key={i}
              className="h-[120px] relative cursor-pointer transition-all hover:brightness-[0.97]"
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
            >
              {hoveredIndex === i && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm font-mono tracking-wider"
                    style={{ color: textColor === "white" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)" }}
                  >
                    {color.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <LikeButton paletteId={palette.id} initialCount={palette.likesCount} />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            <MaterialIcon name="link" size={16} weight={300} />
            Link
          </button>
        </div>
      </div>

      {/* Color circles */}
      <div className="flex items-center justify-center gap-6 mt-8">
        {palette.colors.map((color, i) => (
          <button
            key={i}
            className="w-10 h-10 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => copy(color.toUpperCase(), color.toUpperCase())}
            title={color.toUpperCase()}
          />
        ))}
      </div>

      {/* Tooltip */}
      <p className="text-center text-xs text-gray-400 mt-3">
        Click a color to copy
      </p>
    </div>
  );
}
