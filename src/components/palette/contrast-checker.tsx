"use client";

import { getContrastPairs, type WcagLevel } from "@/lib/color-utils";
import { cn } from "@/lib/utils";

interface ContrastCheckerProps {
  colors: string[];
}

const levelConfig: Record<WcagLevel, { bg: string; text: string }> = {
  AAA: { bg: "bg-green-100", text: "text-green-700" },
  AA: { bg: "bg-yellow-100", text: "text-yellow-700" },
  "AA Large": { bg: "bg-orange-100", text: "text-orange-700" },
  Fail: { bg: "bg-red-100", text: "text-red-700" },
};

export function ContrastChecker({ colors }: ContrastCheckerProps) {
  const pairs = getContrastPairs(colors);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Contrast Check (WCAG 2.1)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pairs.map((pair, i) => {
          const config = levelConfig[pair.level];
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100"
            >
              <div className="flex gap-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: pair.color1 }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: pair.color2 }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono flex-1">
                {pair.ratio}:1
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  config.bg,
                  config.text
                )}
              >
                {pair.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
