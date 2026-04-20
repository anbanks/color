import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";

const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

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

  const model = (await env.CACHE.get("settings:OPENROUTER_MODEL")) || DEFAULT_MODEL;

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
        messages: [
          { role: "user", content: "Reply with exactly one word: OK" },
        ],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return Response.json({
        ok: false,
        error: data.error?.message || `OpenRouter ${res.status}`,
      });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[]; model?: string };
    const reply = data.choices?.[0]?.message?.content?.trim() || "";

    return Response.json({ ok: true, reply, model: data.model || model });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
