import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const raw = await env.CACHE.get("queue:ai_log");
  const logs = raw ? JSON.parse(raw) : [];

  return Response.json({ logs });
}
