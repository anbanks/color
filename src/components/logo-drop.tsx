export function LogoDrop({ className }: { className?: string }) {
  const dropPath =
    "M20 2 C 20 2 32 15 32 24 C 32 30 26 35 20 35 C 14 35 8 30 8 24 C 8 15 20 2 20 2 Z";
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Color Magic logo"
    >
      <defs>
        <clipPath id="color-drop-clip">
          <path d={dropPath} />
        </clipPath>
      </defs>
      <g clipPath="url(#color-drop-clip)">
        <path
          className="logo-liquid"
          d="M-20 22 Q -15 18 -10 22 Q -5 26 0 22 Q 5 18 10 22 Q 15 26 20 22 Q 25 18 30 22 Q 35 26 40 22 Q 45 18 50 22 Q 55 26 60 22 L 60 40 L -20 40 Z"
        />
      </g>
      <path
        d={dropPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
