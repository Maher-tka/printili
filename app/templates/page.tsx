import type { Metadata } from "next";
import { CategoryPreviewCard } from "@/components/category-preview-card";
import { TemplateCard } from "@/components/template-card";
import { TemplateFilters } from "@/components/template-filters";
import { categories } from "@/data/seed-templates";
import { getFilteredTemplates, parseTemplateFilters } from "@/lib/templates";

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

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const filters = parseTemplateFilters((await searchParams) ?? {});
  const templates = getFilteredTemplates(filters);

  return (
    <>
      <section className="page-shell py-12 sm:py-16" aria-labelledby="templates-heading">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-3xl">
            <h1 id="templates-heading" className="font-display text-4xl leading-tight sm:text-6xl">
              Choose the frame before the photos become a gift
            </h1>
            <p className="mt-5 text-base leading-7 text-charcoal-soft">
              Browse designs by occasion, template size, product type, or photo count. Each template
              carries its own print size, customer preview, and admin-ready export setup.
            </p>
          </div>
          <div className="grid gap-1 overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-charcoal p-2 shadow-soft sm:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <div className="rounded-[6px] bg-paper/8 p-4 text-paper" key={category.id}>
                <p className="font-display text-2xl">{category.name}</p>
                <p className="mt-2 text-xs leading-5 text-paper/68">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryPreviewCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section className="page-shell pb-16 sm:pb-24" aria-labelledby="template-results-heading">
        <TemplateFilters
          selectedCategory={filters.categoryId}
          selectedPhotoCount={filters.photoCount}
          selectedProductType={filters.productType}
          selectedSheetSize={filters.sheetSize}
        />

        <div className="mt-9 flex items-end justify-between gap-4">
          <div>
            <h2
              id="template-results-heading"
              className="font-display text-3xl leading-tight sm:text-4xl"
            >
              Template library
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              {templates.length} matching design{templates.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {templates.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="soft-card mt-6 p-7">
            <h3 className="text-xl font-semibold">No templates match these filters yet.</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal-soft">
              Try a wider photo count or choose another category. The template library is built to
              grow as the product catalog expands.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
