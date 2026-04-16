import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Color Grid — Discover Beautiful Color Palettes";

// Simple brand-level OG image used when no route-specific one is available.
// Renders four brand-palette bands and the wordmark on top.
export default function Image() {
  const colors = ["#FF6B6B", "#4ECDC4", "#FEED30", "#667EEA"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Palette bands — asymmetric heights mirroring PaletteCard. */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "58%" }}>
          <div style={{ background: colors[0], flexGrow: 41 }} />
          <div style={{ background: colors[1], flexGrow: 26 }} />
          <div style={{ background: colors[2], flexGrow: 18 }} />
          <div style={{ background: colors[3], flexGrow: 15 }} />
        </div>
        {/* Wordmark block. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 84, fontWeight: 700, color: "#111", letterSpacing: "-2px" }}>
            Color Grid
          </div>
          <div style={{ fontSize: 30, color: "#555", marginTop: 12 }}>
            Discover beautiful color palettes
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
