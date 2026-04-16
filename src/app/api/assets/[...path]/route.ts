import { getCloudflareContext } from "@opennextjs/cloudflare";

// Public read-only proxy in front of the R2 bucket. Anyone with the URL can
// fetch the object; never expose this for anything that should be private.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");
  if (!key) return new Response("Not Found", { status: 404 });

  const { env } = await getCloudflareContext({ async: true });
  const object = await env.STORAGE.get(key);
  if (!object) return new Response("Not Found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  // Long-lived cache — keys include a content hash, so objects are immutable.
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
