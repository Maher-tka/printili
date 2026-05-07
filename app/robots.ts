import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/project"]
    },
    sitemap: "https://printable-photo-montage.example/sitemap.xml"
  };
}
