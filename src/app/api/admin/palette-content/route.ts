import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { paletteContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const row = await db
    .select()
    .from(paletteContent)
    .where(and(eq(paletteContent.paletteId, id), eq(paletteContent.locale, locale as "en")))
    .limit(1);

  if (!row[0]) return Response.json({ content: null });

  return Response.json({
    content: {
      title: row[0].title,
      description: row[0].description,
      applications: row[0].applications,
      psychology: row[0].psychology,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    paletteId: string;
    locale: string;
    title: string;
    description: string;
    applications: string;
    psychology: string;
  };

  if (!body.paletteId || !body.locale) {
    return Response.json({ error: "paletteId and locale required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const existing = await db
    .select({ id: paletteContent.id })
    .from(paletteContent)
    .where(and(eq(paletteContent.paletteId, body.paletteId), eq(paletteContent.locale, body.locale as "en")))
    .limit(1);

  if (existing[0]) {
    await db.update(paletteContent)
      .set({
        title: body.title,
        description: body.description,
        applications: body.applications,
        psychology: body.psychology,
      })
      .where(eq(paletteContent.id, existing[0].id));
  } else {
    await db.insert(paletteContent).values({
      id: createId(),
      paletteId: body.paletteId,
      locale: body.locale as "en",
      title: body.title,
      description: body.description,
      applications: body.applications,
      psychology: body.psychology,
    });
  }

  return Response.json({ ok: true });
}
