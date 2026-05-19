import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { PublicPageHero } from "@/components/printili/PublicPageHero";
import {
  getActiveCatalogCategories,
  getActiveCatalogProductsByCategorySlug,
  getCatalogCategoryBySlug
} from "@/lib/catalog";

type CatalogCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getActiveCatalogCategories().map((category) => ({
    slug: category.slug
  }));
}

export async function generateMetadata({
  params
}: CatalogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCatalogCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category"
    };
  }

  return {
    title: `${category.name} Products`,
    description: category.description,
    openGraph: {
      title: `${category.name} Products`,
      description: category.description
    }
  };
}

export default async function CatalogCategoryPage({ params }: CatalogCategoryPageProps) {
  const { slug } = await params;
  const category = getCatalogCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getActiveCatalogProductsByCategorySlug(category.slug);

  return (
    <section className="page-shell printili-public-page" aria-labelledby="catalog-category-heading">
      <PublicPageHero
        eyebrow={category.name}
        image={category.heroImage}
        imageAlt={category.heroImageAlt}
        intro={category.description}
        titleId="catalog-category-heading"
        title={category.name}
      />

      <section className="printili-catalog-products" aria-labelledby="catalog-products-heading">
        <div>
          <p>Products</p>
          <h2 id="catalog-products-heading">Choose a {category.name.toLowerCase()} printable.</h2>
        </div>

        <div>
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </section>
  );
}
