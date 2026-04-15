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
        <rect className="logo-cell logo-cell-1" x={4} y={4}  width={32} height={13} />
        <rect className="logo-cell logo-cell-2" x={4} y={17} width={32} height={8} />
        <rect className="logo-cell logo-cell-3" x={4} y={25} width={32} height={6} />
        <rect className="logo-cell logo-cell-4" x={4} y={31} width={32} height={5} />
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
