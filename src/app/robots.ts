import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/create"],
      },
    ],
    sitemap: "https://color.anbanks.com.br/sitemap.xml",
  };
}
