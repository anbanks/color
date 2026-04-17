import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 36,
        }}
      >
        <svg viewBox="0 0 40 40" width="130" height="130">
          <defs>
            <clipPath id="d">
              <path d="M20 2 C 20 2 32 15 32 24 C 32 30 26 35 20 35 C 14 35 8 30 8 24 C 8 15 20 2 20 2 Z" />
            </clipPath>
            <linearGradient id="g" x1="0" y1="20" x2="0" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4ECDC4" />
              <stop offset="1" stopColor="#667EEA" />
            </linearGradient>
          </defs>
          <g clipPath="url(#d)">
            <rect x="0" y="20" width="40" height="20" fill="url(#g)" />
          </g>
          <path
            d="M20 2 C 20 2 32 15 32 24 C 32 30 26 35 20 35 C 14 35 8 30 8 24 C 8 15 20 2 20 2 Z"
            fill="none"
            stroke="#222"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
