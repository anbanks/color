import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

const LOCALES = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "hi"] as const;
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

function buildPrompt(colors: string[]): string {
  return `You are a color palette expert. Given these 4 hex colors: ${colors.join(", ")}

Generate content for this palette in ALL 9 languages. Return ONLY a JSON object (no markdown fences) with this exact structure:

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

Rules for each language:
- title: Creative 2-4 word name (NOT "Color Palette", NOT hex codes)
- description: 1-2 sentence SEO description mentioning colors and mood
- applications: 1-2 sentences about practical uses (web, branding, interior, fashion)
- psychology: 1-2 sentences about the psychological effect
- Each field MUST be written in the respective language
- Return valid JSON only`;
}

interface ContentFields {
  title: string;
  description: string;
  applications: string;
  psychology: string;
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
        messages: [{ role: "user", content: buildPrompt(colors) }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return Response.json({ ok: false, error: err.error?.message || `OpenRouter ${res.status}` });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    let content = data.choices?.[0]?.message?.content?.trim() || "";
    content = content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

    const allLocales = JSON.parse(content) as Record<string, ContentFields>;
    let saved = 0;

    for (const locale of LOCALES) {
      const fields = allLocales[locale];
      if (!fields?.title) continue;

      const existing = await db
        .select({ id: paletteContent.id })
        .from(paletteContent)
        .where(and(eq(paletteContent.paletteId, body.paletteId), eq(paletteContent.locale, locale)))
        .limit(1);

      if (existing[0]) {
        await db.update(paletteContent)
          .set({ title: fields.title, description: fields.description, applications: fields.applications, psychology: fields.psychology })
          .where(eq(paletteContent.id, existing[0].id));
      } else {
        await db.insert(paletteContent).values({
          id: createId(),
          paletteId: body.paletteId,
          locale,
          title: fields.title,
          description: fields.description,
          applications: fields.applications,
          psychology: fields.psychology,
        });
      }
      saved++;
    }

    return Response.json({ ok: true, saved, model, sample: allLocales.en?.title });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
