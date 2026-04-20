import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

const LOCALES = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"];
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

const LOCALE_NAMES: Record<string, string> = {
  en: "English", pt: "Portuguese", es: "Spanish", fr: "French",
  de: "German", it: "Italian", ja: "Japanese", zh: "Chinese", hi: "Hindi",
};

function buildPrompt(colors: string[], locale: string): string {
  const lang = LOCALE_NAMES[locale] || "English";
  return `You are a color palette expert. Given these 4 hex colors: ${colors.join(", ")}

Generate content in ${lang} for this palette. Return ONLY a JSON object with these 4 fields (no markdown, no code fences):
{
  "title": "A creative 2-4 word name for this palette (not generic, evocative)",
  "description": "1-2 sentence SEO description of this palette, mentioning colors and mood",
  "applications": "1-2 sentences about practical uses (web design, branding, interior, fashion, etc.)",
  "psychology": "1-2 sentences about the psychological effect of these colors"
}

Rules:
- Write in ${lang} ONLY
- Title should be creative and unique, NOT include "Color Palette" or hex codes
- Keep each field concise (1-2 sentences max)
- Return valid JSON only, no extra text`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { paletteId?: string };
  if (!body.paletteId) {
    return Response.json({ error: "paletteId required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = await env.CACHE.get("settings:OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "OpenRouter API key not configured" }, { status: 400 });
  }
  const model = (await env.CACHE.get("settings:OPENROUTER_MODEL")) || DEFAULT_MODEL;

  const db = getDb(env.DB);
  const row = await db.select().from(palettes).where(eq(palettes.id, body.paletteId)).limit(1);
  if (!row[0]) {
    return Response.json({ error: "Palette not found" }, { status: 404 });
  }

  const colors = JSON.parse(row[0].colors) as string[];
  const results: Record<string, { title: string; description: string; applications: string; psychology: string }> = {};

  for (const locale of LOCALES) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://colorgrid.co",
          "X-Title": "Color Grid",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: buildPrompt(colors, locale) }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        results[locale] = {
          title: `Color Palette ${colors.join(" ")}`,
          description: err.error?.message || "Generation failed",
          applications: "",
          psychology: "",
        };
        continue;
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      let content = data.choices?.[0]?.message?.content?.trim() || "";

      // Strip markdown fences if present
      content = content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

      const parsed = JSON.parse(content) as {
        title: string;
        description: string;
        applications: string;
        psychology: string;
      };

      results[locale] = parsed;

      // Insert into DB
      const existing = await db
        .select({ id: paletteContent.id })
        .from(paletteContent)
        .where(and(eq(paletteContent.paletteId, body.paletteId), eq(paletteContent.locale, locale as "en")))
        .limit(1);

      if (existing[0]) {
        await db.update(paletteContent)
          .set({
            title: parsed.title,
            description: parsed.description,
            applications: parsed.applications,
            psychology: parsed.psychology,
          })
          .where(eq(paletteContent.id, existing[0].id));
      } else {
        await db.insert(paletteContent).values({
          id: createId(),
          paletteId: body.paletteId,
          locale: locale as "en",
          title: parsed.title,
          description: parsed.description,
          applications: parsed.applications,
          psychology: parsed.psychology,
        });
      }
    } catch (e) {
      results[locale] = {
        title: `Color Palette ${colors.join(" ")}`,
        description: String(e),
        applications: "",
        psychology: "",
      };
    }
  }

  return Response.json({
    ok: true,
    paletteId: body.paletteId,
    colors,
    model,
    results,
  });
}
