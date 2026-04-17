import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          overflow: "hidden",
          background: "#ffffff",
          border: "2px solid #e5e5e5",
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
