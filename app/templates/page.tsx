import type { Metadata } from "next";
import { CategoryPreviewCard } from "@/components/category-preview-card";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import { TemplateCard } from "@/components/template-card";
import { TemplateFilters } from "@/components/template-filters";
import { categories } from "@/data/seed-templates";
import { getFilteredPublicTemplates } from "@/lib/public-template-store";
import { parseTemplateFilters } from "@/lib/templates";

type QueryParams = Record<string, string | string[] | undefined>;

type TemplatesPageProps = {
  searchParams?: Promise<QueryParams>;
};

export const metadata: Metadata = {
  title: "Browse Printable Photo Montage Templates",
  description:
    "Browse premium printable photo montage templates for baby gifts, couples, birthdays, families, weddings, cut sheets, and custom gifts.",
  openGraph: {
    title: "Browse Printable Photo Montage Templates",
    description:
      "Choose a printable photo montage design, then start with your photos for a finished printed gift."
  }
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const filters = parseTemplateFilters((await searchParams) ?? {});
  const templates = await getFilteredPublicTemplates(filters);

  return (
    <>
      <section className="page-shell printili-public-page" aria-labelledby="templates-heading">
        <PublicPageHero
          eyebrow="Products"
          image="/printili/memory-decorate-space-hq.webp"
          imageAlt="Framed collage held in warm light"
          intro="Browse designs by occasion, product type, and photo count, then turn the right one into a finished printed keepsake."
          primaryAction={{ href: "/start", label: "Start creating" }}
          secondaryAction={{ href: "/occasions", label: "Shop by occasion" }}
          titleId="templates-heading"
          title="Choose the frame before the photos become a gift."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryPreviewCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section className="printili-products-catalog" aria-labelledby="template-results-heading">
        <div className="page-shell printili-products-catalog__inner">
          <TemplateFilters
            selectedCategory={filters.categoryId}
            selectedDeliveryType={filters.deliveryType}
            selectedPhotoCount={filters.photoCount}
            selectedPricedOnly={filters.pricedOnly}
            selectedProductType={filters.productType}
            selectedSheetSize={filters.sheetSize}
          />

          <div className="printili-products-catalog__heading">
            <div>
              <p>Design library</p>
              <h2 id="template-results-heading">Choose the keepsake style.</h2>
            </div>
            <span>
              {templates.length} matching design{templates.length === 1 ? "" : "s"}
            </span>
          </div>

          {templates.length > 0 ? (
            <div className="printili-template-grid-premium">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="printili-template-empty">
              <h3>No templates match these filters yet.</h3>
              <p>
                Try a wider photo count or choose another category. The template library is built
                to grow as the product catalog expands.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
