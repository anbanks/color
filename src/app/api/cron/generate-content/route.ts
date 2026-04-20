import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const LOCALES = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"] as const;
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const RATE_KEY = "queue:ai_generate_per_run";
const LOG_KEY = "queue:ai_log";
const DEFAULT_RATE = 3;

const LOCALE_NAMES: Record<string, string> = {
  en: "English", pt: "Portuguese", es: "Spanish", fr: "French",
  de: "German", it: "Italian", ja: "Japanese", zh: "Chinese", hi: "Hindi",
};

function buildPrompt(colors: string[]): string {
  return `You are a color palette expert. Given these 4 hex colors: ${colors.join(", ")}

Generate content for this palette in ALL 9 languages. Return ONLY a JSON object (no markdown fences):

{
  "en": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "pt": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "es": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "fr": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "de": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "it": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "ja": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "zh": { "title": "...", "description": "...", "applications": "...", "psychology": "..." },
  "hi": { "title": "...", "description": "...", "applications": "...", "psychology": "..." }
}

Rules:
- title: Creative 2-4 word name, NOT "Color Palette", NOT hex codes
- description: 1-2 sentence SEO description. INCLUDE the hex codes in the description.
- applications: 1-2 sentences about practical uses
- psychology: 1-2 sentences about psychological effect
- Each field in its respective language
- Valid JSON only`;
}

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = await env.CACHE.get("settings:OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json({ generated: 0, message: "No OpenRouter key configured" });
  }

  const model = (await env.CACHE.get("settings:OPENROUTER_MODEL")) || DEFAULT_MODEL;
  const rateStr = await env.CACHE.get(RATE_KEY);
  const rate = rateStr ? Math.min(parseInt(rateStr, 10) || DEFAULT_RATE, 10) : DEFAULT_RATE;

  const db = getDb(env.DB);

  // Find palettes without complete content (< 9 locales) using subquery
  const needsContent = await db
    .select({ id: palettes.id, colors: palettes.colors })
    .from(palettes)
    .where(sql`${palettes.status} IN ('approved', 'published') AND ${palettes.id} NOT IN (
      SELECT ${paletteContent.paletteId} FROM ${paletteContent}
      GROUP BY ${paletteContent.paletteId} HAVING count(*) >= 9
    )`)
    .orderBy(palettes.createdAt)
    .limit(rate);

  if (!needsContent.length) {
    return Response.json({ generated: 0, message: "All palettes have complete content" });
  }

  const toProcess = needsContent.map((c) => ({
    id: c.id,
    colors: JSON.parse(c.colors) as string[],
  }));

  let generated = 0;
  const ids: string[] = [];
  const errors: { id: string; error: string }[] = [];
  const details: { id: string; colors: string[]; localesSaved: string[]; title?: string; rawResponse?: string }[] = [];

  for (const palette of toProcess) {
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
          messages: [{ role: "user", content: buildPrompt(palette.colors) }],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!res.ok) continue;

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      let content = data.choices?.[0]?.message?.content?.trim() || "";
      content = content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

      const allLocales = JSON.parse(content) as Record<string, { title: string; description: string; applications: string; psychology: string }>;

      for (const locale of LOCALES) {
        const fields = allLocales[locale];
        if (!fields?.title) continue;

        const safe = {
          title: fields.title || "Untitled",
          description: fields.description || "",
          applications: fields.applications || "",
          psychology: fields.psychology || "",
        };

        const existing = await db
          .select({ id: paletteContent.id })
          .from(paletteContent)
          .where(sql`${paletteContent.paletteId} = ${palette.id} AND ${paletteContent.locale} = ${locale}`)
          .limit(1);

        if (existing[0]) {
          await db.update(paletteContent)
            .set(safe)
            .where(eq(paletteContent.id, existing[0].id));
        } else {
          await db.insert(paletteContent).values({
            id: createId(),
            paletteId: palette.id,
            locale,
            ...safe,
          });
        }
      }

      const localesSaved = Object.keys(allLocales).filter(l => allLocales[l]?.title);
      details.push({
        id: palette.id,
        colors: palette.colors,
        localesSaved,
        title: allLocales.en?.title,
        rawResponse: content.slice(0, 500),
      });
      generated++;
      ids.push(palette.id);
    } catch (e) {
      errors.push({ id: palette.id, error: String(e) });
    }
  }

  const now = new Date().toISOString();
  const logEntry = { time: now, generated, errors: errors.length, ids, errorDetails: errors, details, model, rate };

  try {
    // Keep last 50 log entries
    const prevLog = await env.CACHE.get(LOG_KEY);
    const logs = prevLog ? JSON.parse(prevLog) : [];
    logs.unshift(logEntry);
    await env.CACHE.put(LOG_KEY, JSON.stringify(logs.slice(0, 50)));
    await env.CACHE.put("queue:ai_last_run", now);
  } catch {}

  return Response.json({ generated, rate, ids, errors });
}
