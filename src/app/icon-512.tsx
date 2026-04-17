import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          flexDirection: "column",
          borderRadius: 102,
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
