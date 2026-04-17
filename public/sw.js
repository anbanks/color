// Minimal service worker required by Chrome to show the PWA install prompt.
// No caching strategy — the site runs fully online via Cloudflare Workers.
self.addEventListener("fetch", () => {});
