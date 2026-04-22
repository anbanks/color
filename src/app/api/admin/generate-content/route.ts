import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes, paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import {
  ALL_LOCALES,
  generatePaletteContent,
  WORKERS_AI_MODEL,
} from "@/lib/generate-content";

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
  const db = getDb(env.DB);

  const row = await db.select().from(palettes).where(eq(palettes.id, body.paletteId)).limit(1);
  if (!row[0]) {
    return Response.json({ error: "Palette not found" }, { status: 404 });
  }

  const colors = JSON.parse(row[0].colors) as string[];

  try {
    const result = await generatePaletteContent(env.AI, {
      colors,
      locales: ALL_LOCALES,
    });

    let saved = 0;
    for (const locale of ALL_LOCALES) {
      const fields = result.content[locale];
      if (!fields?.title) continue;

      const existing = await db
        .select({ id: paletteContent.id })
        .from(paletteContent)
        .where(and(eq(paletteContent.paletteId, body.paletteId), eq(paletteContent.locale, locale)))
        .limit(1);

      if (existing[0]) {
        await db.update(paletteContent)
          .set({
            title: fields.title,
            description: fields.description || "",
            applications: fields.applications || "",
            psychology: fields.psychology || "",
          })
          .where(eq(paletteContent.id, existing[0].id));
      } else {
        await db.insert(paletteContent).values({
          id: createId(),
          paletteId: body.paletteId,
          locale,
          title: fields.title,
          description: fields.description || "",
          applications: fields.applications || "",
          psychology: fields.psychology || "",
        });
      }
      saved++;
    }

    return Response.json({ ok: true, saved, model: WORKERS_AI_MODEL, sample: result.content.en?.title });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
