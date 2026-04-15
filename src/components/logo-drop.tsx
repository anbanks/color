"use client";

import { useId } from "react";

export function LogoDrop({ className }: { className?: string }) {
  const rawId = useId();
  const clipId = `logo-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const shape = { x: 4, y: 4, width: 32, height: 32, rx: 9 };
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Color Grid logo"
    >
      <defs>
        <clipPath id={clipId}>
          <rect {...shape} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          className="logo-liquid"
          d="M-20 22 Q -15 18 -10 22 Q -5 26 0 22 Q 5 18 10 22 Q 15 26 20 22 Q 25 18 30 22 Q 35 26 40 22 Q 45 18 50 22 Q 55 26 60 22 L 60 40 L -20 40 Z"
        />
      </g>
      <rect
        {...shape}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
