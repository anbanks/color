import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          flexDirection: "column",
          borderRadius: 38,
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
