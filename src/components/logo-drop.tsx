"use client";

export function LogoDrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Color Grid logo"
    >
      <rect className="logo-cell logo-cell-1" x={7}  y={7}  width={12} height={12} rx={2} />
      <rect className="logo-cell logo-cell-2" x={21} y={7}  width={12} height={12} rx={2} />
      <rect className="logo-cell logo-cell-3" x={7}  y={21} width={12} height={12} rx={2} />
      <rect className="logo-cell logo-cell-4" x={21} y={21} width={12} height={12} rx={2} />
      <rect
        x={4}
        y={4}
        width={32}
        height={32}
        rx={9}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
