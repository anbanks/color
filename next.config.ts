import type { NextConfig } from "next";
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
};

export default nextConfig;
