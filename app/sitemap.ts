import type { MetadataRoute } from "next";
import { catalogCategories } from "@/data/catalog";
import { publicPages } from "@/data/public-pages";
import { seoLandingPages } from "@/data/seo-pages";
import { categories, featuredTemplates } from "@/data/seed-templates";

const baseUrl = "https://printable-photo-montage.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/start",
    "/templates",
    "/cart",
    "/customer",
    "/newsletter",
    ...catalogCategories
      .filter((category) => category.isActive)
      .map((category) => `/categories/${category.slug}`),
    ...categories.map((category) => `/templates/${category.slug}`),
    ...featuredTemplates.map((template) => `/template/${template.slug}`),
    ...seoLandingPages.map((page) => `/${page.slug}`),
    ...publicPages.map((page) => `/${page.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
