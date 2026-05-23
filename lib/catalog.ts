import { catalogCategories, catalogProducts } from "@/data/catalog";

export function getActiveCatalogCategories() {
  return catalogCategories.filter((category) => category.isActive);
}

export function getCatalogCategoryBySlug(slug: string) {
  return getActiveCatalogCategories().find((category) => category.slug === slug);
}

export function getActiveCatalogProductsByCategorySlug(categorySlug: string) {
  return catalogProducts.filter(
    (product) => product.isActive && product.categorySlug === categorySlug
  );
}

export function formatCatalogProductSize(product: {
  widthCm: number;
  heightCm: number;
  diameterCm?: number;
  shape: string;
}) {
  if (product.shape === "circle" && product.diameterCm) {
    return `${formatCm(product.diameterCm)} cm diameter`;
  }

  return `${formatCm(product.widthCm)} x ${formatCm(product.heightCm)} cm`;
}

function formatCm(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
