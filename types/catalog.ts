export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  cardDescription: string;
  cardImage: string;
  cardImageAlt: string;
  heroImage: string;
  heroImageAlt: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  widthCm: number;
  heightCm: number;
  diameterCm?: number;
  shape: string;
  isActive: boolean;
  customizableFields: string[];
};
