import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { palettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !["approved", "rejected", "pending", "published"].includes(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    if (body.status === "approved" || body.status === "published") {
      await db.update(palettes).set({ status: "published", publishedAt: new Date() }).where(eq(palettes.id, id));
    } else {
      await db.update(palettes).set({ status: body.status as "pending" | "rejected" }).where(eq(palettes.id, id));
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    await db.delete(palettes).where(eq(palettes.id, id));
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
