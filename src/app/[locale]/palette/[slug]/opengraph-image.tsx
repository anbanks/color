import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Color Grid palette";

interface Props {
  params: { slug: string; locale: string };
}

async function loadColors(slug: string): Promise<string[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const rows = await db
      .select({ colors: palettes.colors })
      .from(palettes)
      .where(eq(palettes.slug, slug))
      .limit(1);
    if (rows[0]?.colors) {
      const parsed = JSON.parse(rows[0].colors) as string[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    // fall through to defaults
  }
  // Fallback — derive from slug if it contains hex segments.
  const fromSlug = slug
    .split("-")
    .filter((s) => /^[0-9a-f]{6}$/i.test(s))
    .map((s) => `#${s}`);
  if (fromSlug.length >= 2) return fromSlug;
  return ["#FF6B6B", "#4ECDC4", "#FEED30", "#667EEA"];
}

export default async function Image({ params }: Props) {
  const colors = await loadColors(params.slug);
  const heights = ["41%", "26%", "18%", "15%"]; // same ratios as PaletteCard
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
        {/* Palette — 70% of the canvas. */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "70%" }}>
          {colors.slice(0, 4).map((c, i) => (
            <div
              key={i}
              style={{
                background: c,
                height: heights[i] ?? `${Math.round(100 / colors.length)}%`,
                width: "100%",
              }}
            />
          ))}
        </div>
        {/* Hex row + wordmark. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          <div style={{ display: "flex", gap: 28, fontFamily: "monospace", fontSize: 28, color: "#444", letterSpacing: "1px" }}>
            {colors.slice(0, 4).map((c, i) => (
              <span key={i}>{c.toUpperCase()}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#111", letterSpacing: "-1px" }}>
              Color Grid
            </div>
            <div style={{ marginLeft: "auto", fontSize: 20, color: "#888" }}>colorgrid.co</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
