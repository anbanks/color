"use client";

// 3x3 grid. Each cell's animation delay = row + col, so the color wave
// flows diagonally from top-left to bottom-right.
const DELAYS: number[][] = [
  [0, 1, 2],
  [1, 2, 3],
  [2, 3, 4],
];

export function LogoDrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Color Grid logo"
    >
      {DELAYS.flatMap((row, r) =>
        row.map((d, c) => (
          <rect
            key={`${r}-${c}`}
            className={`logo-grid logo-grid-d${d}`}
            x={3 + c * 12}
            y={3 + r * 12}
            width={10}
            height={10}
            rx={2}
          />
        ))
      )}
    </svg>
  );
}
