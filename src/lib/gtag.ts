type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: GtagFn };
  return typeof w.gtag === "function" ? w.gtag : null;
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("event", name, params ?? {});
}

export function trackPageview(url: string, measurementId: string): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("config", measurementId, { page_path: url });
}
