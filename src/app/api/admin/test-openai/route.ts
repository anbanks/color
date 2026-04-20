import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = await env.CACHE.get("settings:OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json({ ok: false, error: "No API key configured" }, { status: 400 });
  }

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
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "user", content: "Reply with exactly: OK" },
        ],
        max_tokens: 5,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return Response.json({
        ok: false,
        error: data.error?.message || `OpenAI ${res.status}`,
      });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim() || "";

    return Response.json({ ok: true, reply, model: "llama-3.1-8b-instruct (free)" });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
