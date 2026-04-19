import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = (await request.json()) as { token?: string; password?: string };
  if (!token || !password || password.length < 6) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const userId = await env.CACHE.get(`reset:${token}`);
  if (!userId) {
    return Response.json({ error: "Token expired or invalid" }, { status: 400 });
  }

  const db = getDb(env.DB);
  const hashed = await bcrypt.hash(password, 12);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
  await env.CACHE.delete(`reset:${token}`);

  return Response.json({ ok: true });
}
