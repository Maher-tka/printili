import type { MetadataRoute } from "next";
import { seoLandingPages } from "@/data/seo-pages";
import { featuredTemplates } from "@/data/seed-templates";

const baseUrl = "https://printable-photo-montage.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/start",
    "/templates",
    ...featuredTemplates.map((template) => `/template/${template.slug}`),
    ...seoLandingPages.map((page) => `/${page.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
