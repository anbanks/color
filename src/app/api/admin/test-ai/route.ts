import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";
import { WORKERS_AI_MODEL } from "@/lib/generate-content";

export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });

  try {
    const out = (await env.AI.run(WORKERS_AI_MODEL, {
      messages: [{ role: "user", content: "Reply with exactly one word: OK" }],
      max_tokens: 10,
    })) as { response?: string };

    const reply = (out.response || "").trim();
    return Response.json({ ok: true, reply, model: WORKERS_AI_MODEL });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
