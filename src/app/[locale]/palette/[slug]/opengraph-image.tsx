import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = "Color Magic palette";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function OgImage({ params }: PageProps) {
  const { slug, locale } = await params;

  let colors: string[] = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
  let title = `Color Palette ${colors.join(" ")}`;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const rows = await db
      .select()
      .from(palettes)
      .where(eq(palettes.slug, slug))
      .limit(1);
    if (rows[0]) {
      colors = JSON.parse(rows[0].colors) as string[];
      title = `Color Palette ${colors.join(" ")}`;
      const safeLocale: "en" | "pt" | "es" = (
        ["en", "pt", "es"].includes(locale) ? locale : "en"
      ) as "en" | "pt" | "es";
      const c = await db
        .select()
        .from(paletteContent)
        .where(
          and(
            eq(paletteContent.paletteId, rows[0].id),
            eq(paletteContent.locale, safeLocale)
          )
        )
        .limit(1);
      if (c[0]?.title) title = c[0].title;
    }
  } catch {
    // fall back to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f0f0f",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {colors.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: color,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 18,
                color: "rgba(255,255,255,0.85)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 1,
                fontFamily: "monospace",
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              {color.toUpperCase()}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 56px",
            backgroundColor: "#0f0f0f",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#ffffff",
              }}
            >
              {title.length > 64 ? title.slice(0, 61) + "…" : title}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.55)",
                marginTop: 6,
              }}
            >
              {SITE_NAME}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {colors.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: c,
                  border: "2px solid rgba(255,255,255,0.85)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
