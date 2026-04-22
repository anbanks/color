import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import {
  ALL_LOCALES,
  generatePaletteContent,
  WORKERS_AI_MODEL,
} from "@/lib/generate-content";

const RATE_KEY = "queue:ai_generate_per_run";
const LOG_KEY = "queue:ai_log";
const DEFAULT_RATE = 3;

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });

  const paused = await env.CACHE.get("settings:AI_PAUSED");
  if (paused === "true") {
    return Response.json({ generated: 0, message: "AI generation paused" });
  }

  const rateStr = await env.CACHE.get(RATE_KEY);
  const rate = rateStr ? Math.min(parseInt(rateStr, 10) || DEFAULT_RATE, 10) : DEFAULT_RATE;

  const db = getDb(env.DB);

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
  const details: { id: string; colors: string[]; localesSaved: string[]; title?: string; prompt?: string; request?: object; response?: string; httpStatus?: number }[] = [];

  for (const palette of toProcess) {
    try {
      const result = await generatePaletteContent(env.AI, {
        colors: palette.colors,
        locales: ALL_LOCALES,
      });

      for (const locale of ALL_LOCALES) {
        const fields = result.content[locale];
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

      const localesSaved = Object.keys(result.content).filter((l) => result.content[l]?.title);
      details.push({
        id: palette.id,
        colors: palette.colors,
        localesSaved,
        title: result.content.en?.title,
        prompt: `${palette.colors.length} colors / ${ALL_LOCALES.length} locales`,
        request: result.request,
        response: result.raw.slice(0, 1500),
        httpStatus: 200,
      });
      generated++;
      ids.push(palette.id);
    } catch (e) {
      errors.push({ id: palette.id, error: String(e) });
      details.push({
        id: palette.id,
        colors: palette.colors,
        localesSaved: [],
        request: { model: WORKERS_AI_MODEL, max_tokens: 2000, temperature: 0.7 },
        response: String(e).slice(0, 1000),
      });
    }
  }

  const now = new Date().toISOString();
  const logEntry = { time: now, generated, errors: errors.length, ids, errorDetails: errors, details, model: WORKERS_AI_MODEL, rate };

  try {
    const prevLog = await env.CACHE.get(LOG_KEY);
    const logs = prevLog ? JSON.parse(prevLog) : [];
    logs.unshift(logEntry);
    await env.CACHE.put(LOG_KEY, JSON.stringify(logs.slice(0, 50)));
    await env.CACHE.put("queue:ai_last_run", now);
  } catch {}

  return Response.json({ generated, rate, ids, errors });
}
