// Runs after `opennextjs-cloudflare build` to create a wrapper worker
// that re-exports the OpenNext fetch handler and adds a scheduled()
// handler for Cloudflare Cron Triggers.
//
// The scheduled handler calls the same fetch handler internally
// (no external HTTP round-trip).

const fs = require("fs");
const path = require("path");

const workerPath = path.resolve(".open-next/worker.js");
const wrapperPath = path.resolve(".open-next/worker-entry.js");

if (!fs.existsSync(workerPath)) {
  console.error("ERROR: .open-next/worker.js not found — run opennextjs-cloudflare build first");
  process.exit(1);
}

const wrapper = `
import worker from "./worker.js";

const handler = worker.default || worker;
const doFetch = (url, env, ctx) => {
  const req = new Request(url);
  return handler.fetch ? handler.fetch(req, env, ctx) : handler(req, env, ctx);
};

export default {
  fetch: handler.fetch ? handler.fetch.bind(handler) : handler,
  async scheduled(controller, env, ctx) {
    const cron = controller.cron || "";
    // Every 5 min: generate AI content for palettes
    if (cron === "*/5 * * * *") {
      const resp = await doFetch("https://colorgrid.co/api/cron/generate-content", env, ctx);
      console.log("Cron AI generate:", resp.status);
      return;
    }
    // Hourly: publish palettes with complete translations
    const resp = await doFetch("https://colorgrid.co/api/cron/publish", env, ctx);
    console.log("Cron publish:", resp.status);
  },
};
`;

fs.writeFileSync(wrapperPath, wrapper.trim() + "\n");
console.log("Created .open-next/worker-entry.js with scheduled() handler");
