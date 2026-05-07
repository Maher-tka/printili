import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { TemplateFilters } from "@/components/template-filters";
import { categories } from "@/data/seed-templates";
import { getCategoryBySlug, getFilteredTemplates, parseTemplateFilters } from "@/lib/templates";

type QueryParams = Record<string, string | string[] | undefined>;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<QueryParams>;
};

export function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Template Category"
    };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription
    }
  };
}

export default async function TemplateCategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const filters = {
    ...parseTemplateFilters((await searchParams) ?? {}),
    categoryId: category.id
  };
  const templates = getFilteredTemplates(filters);

  return (
    <section className="page-shell py-12 sm:py-16" aria-labelledby="category-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Printable templates
        </p>
        <h1 id="category-heading" className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
          {category.name} photo montage templates
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">{category.seoDescription}</p>
      </div>

      <div className="mt-8">
        <TemplateFilters
          selectedCategory={filters.categoryId}
          selectedPhotoCount={filters.photoCount}
          selectedProductType={filters.productType}
          selectedSheetSize={filters.sheetSize}
        />
      </div>

      <div className="mt-9">
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{category.name} designs</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          {templates.length} matching design{templates.length === 1 ? "" : "s"}
        </p>
      </div>

      {templates.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="soft-card mt-6 p-7">
          <h2 className="text-xl font-semibold">No templates match these filters yet.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal-soft">
            Try a wider photo count or another sheet size to see more {category.name.toLowerCase()}
            designs.
          </p>
        </div>
      )}
    </section>
  );
}
