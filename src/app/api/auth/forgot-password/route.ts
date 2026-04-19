import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { createId } from "@paralleldrive/cuid2";

const TOKEN_TTL = 3600; // 1 hour

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!found[0]) {
    return Response.json({ ok: true });
  }

  const token = createId();
  await env.CACHE.put(`reset:${token}`, found[0].id, { expirationTtl: TOKEN_TTL });

  const resetUrl = `https://colorgrid.co/en/reset-password?token=${token}`;
  await sendEmail(env, {
    to: email.trim().toLowerCase(),
    subject: "Reset your Color Grid password",
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`,
  });

  return Response.json({ ok: true });
}
