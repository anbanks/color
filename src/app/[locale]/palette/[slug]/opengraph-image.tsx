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

async function loadColors(slug: string, env: CloudflareEnv): Promise<string[]> {
  try {
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
    // ignore; fall back below
  }
  const fromSlug = slug
    .split("-")
    .filter((s) => /^[0-9a-f]{6}$/i.test(s))
    .map((s) => `#${s}`);
  if (fromSlug.length >= 2) return fromSlug;
  return ["#FF6B6B", "#4ECDC4", "#FEED30", "#667EEA"];
}

const IMAGE_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=31536000, immutable",
};

export default async function Image({ params }: Props) {
  const { env } = await getCloudflareContext({ async: true });
  const cacheKey = `og/palette/${params.slug}.png`;

  // Fast path: serve the cached PNG straight from R2.
  const cached = await env.STORAGE.get(cacheKey);
  if (cached) {
    return new Response(cached.body, { headers: IMAGE_HEADERS });
  }

  const colors = await loadColors(params.slug, env);
  const heights = ["41%", "26%", "18%", "15%"]; // same ratios as PaletteCard

  const rendered = new ImageResponse(
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

  // ArrayBuffer so we can both return it and stash a copy in R2.
  const buffer = await rendered.arrayBuffer();
  try {
    await env.STORAGE.put(cacheKey, buffer, {
      httpMetadata: { contentType: "image/png" },
    });
  } catch {
    // Non-fatal — still serve the freshly rendered image.
  }

  return new Response(buffer, { headers: IMAGE_HEADERS });
}
