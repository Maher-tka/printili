import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import { TemplateCard } from "@/components/template-card";
import { TemplateFilters } from "@/components/template-filters";
import { categories } from "@/data/seed-templates";
import { getFilteredPublicTemplates } from "@/lib/public-template-store";
import { getCategoryBySlug, parseTemplateFilters } from "@/lib/templates";

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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const templates = await getFilteredPublicTemplates(filters);

  return (
    <section className="page-shell printili-public-page" aria-labelledby="category-heading">
      <PublicPageHero
        eyebrow="Printable templates"
        image={categoryHeroImage(category.id)}
        imageAlt={category.imageAlt}
        intro={category.seoDescription}
        primaryAction={{ href: "/start", label: "Start creating" }}
        secondaryAction={{ href: "/templates", label: "All products" }}
        titleId="category-heading"
        title={`${category.name} photo montage templates`}
      />

      <div className="mt-8">
        <TemplateFilters
          selectedCategory={filters.categoryId}
          selectedDeliveryType={filters.deliveryType}
          selectedPhotoCount={filters.photoCount}
          selectedPricedOnly={filters.pricedOnly}
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

function categoryHeroImage(categoryId: string) {
  const images: Record<string, string> = {
    baby: "/printili/cat-baby-collages.webp",
    couple: "/printili/story-real-smiles-wide-hq.webp",
    birthday: "/printili/cat-birthday.webp",
    family: "/printili/cat-family-albums.webp",
    wedding: "/printili/cat-wedding-prints.webp",
    cut_sheet: "/printili/cat-polaroids.webp",
    custom: "/printili/cat-personalized-gifts.webp"
  };

  return images[categoryId] ?? "/printili/hero-clean-scene.png";
}
