import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "www.colorgrid.co" }],
        destination: "https://colorgrid.co/",
        permanent: true,
      },
      {
        source: "/:path+",
        has: [{ type: "host", value: "www.colorgrid.co" }],
        destination: "https://colorgrid.co/:path+",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Long-term immutable cache for fingerprinted static assets.
      {
        source: "/:all*(svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Palette detail pages change rarely — long SWR.
      {
        source: "/:locale/palette/:slug",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      // Feeds update with new palettes — short edge cache, long SWR.
      {
        source: "/:locale(en|pt|es|fr|de|it|ja|zh|hi)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:locale(en|pt|es|fr|de|it|ja|zh|hi)/(popular|random|new|palettes/:tag*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  webpack(config, { isServer, webpack }) {
    // Strip Next's built-in ES polyfill bundle on the client. The
    // browserslist targets in package.json already require engines that
    // ship Array.at, Object.hasOwn, etc. natively. Next references the
    // polyfill via a relative require ("../build/polyfills/polyfill-module"),
    // so a name-keyed alias doesn't catch it — replace the resolved module
    // instead.
    if (!isServer) {
      const empty = path.resolve("./src/lib/shims/empty.js");
      config.plugins = config.plugins ?? [];
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[/\\]polyfills[/\\]polyfill-module(\.js)?$/,
          empty
        )
      );
    }
    return config;
  },
};

export default nextConfig;
