import type { MetadataRoute } from "next";
import { publicPages } from "@/data/public-pages";
import { seoLandingPages } from "@/data/seo-pages";
import { getAllPublicTemplates } from "@/lib/public-template-store";
import { categories } from "@/data/seed-templates";

const baseUrl = "https://printable-photo-montage.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await getAllPublicTemplates();

  return [
    "",
    "/start",
    "/templates",
    "/cart",
    "/customer",
    "/newsletter",
    ...categories.map((category) => `/templates/${category.slug}`),
    ...templates.map((template) => `/template/${template.slug}`),
    ...seoLandingPages.map((page) => `/${page.slug}`),
    ...publicPages.map((page) => `/${page.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
