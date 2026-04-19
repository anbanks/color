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

export default {
  fetch: handler.fetch ? handler.fetch.bind(handler) : handler,
  async scheduled(controller, env, ctx) {
    const req = new Request("https://colorgrid.co/api/cron/publish");
    const resp = await (handler.fetch ? handler.fetch(req, env, ctx) : handler(req, env, ctx));
    console.log("Cron publish:", resp.status);
  },
};
`;

fs.writeFileSync(wrapperPath, wrapper.trim() + "\n");
console.log("Created .open-next/worker-entry.js with scheduled() handler");
