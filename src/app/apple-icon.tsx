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
          flexDirection: "column",
          borderRadius: 36,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <div style={{ flex: 1, background: "#ffffff" }} />
        <div
          style={{
            height: "55%",
            background: "linear-gradient(180deg, #4ECDC4 0%, #667EEA 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
