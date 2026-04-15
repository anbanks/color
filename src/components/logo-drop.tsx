"use client";

import { useId } from "react";

export function LogoDrop({ className }: { className?: string }) {
  const rawId = useId();
  const clipId = `logo-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Color Grid logo"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={4} y={4} width={32} height={32} rx={8} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          className="logo-liquid"
          d="M-20 22 Q -15 16 -10 22 Q -5 28 0 22 Q 5 16 10 22 Q 15 28 20 22 Q 25 16 30 22 Q 35 28 40 22 Q 45 16 50 22 Q 55 28 60 22 L 60 40 L -20 40 Z"
        />
      </g>
      <rect
        x={4}
        y={4}
        width={32}
        height={32}
        rx={8}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.18}
        strokeWidth={1.5}
      />
    </svg>
  );
}
