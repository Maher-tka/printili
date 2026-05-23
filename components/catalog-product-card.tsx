import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatCatalogProductSize } from "@/lib/catalog";
import type { CatalogProduct } from "@/types/catalog";

type CatalogProductCardProps = {
  product: CatalogProduct;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  return (
    <Card className="printili-catalog-product-card">
      <CardContent>
        <p>{product.shape === "circle" ? "Round sticker" : "Printable label"}</p>
        <h2>{product.name}</h2>
        <span>{product.description}</span>

        <dl>
          <div>
            <dt>Size</dt>
            <dd>{formatCatalogProductSize(product)}</dd>
          </div>
          <div>
            <dt>Customize</dt>
            <dd>Name, year, colors</dd>
          </div>
        </dl>

        <ul aria-label={`${product.name} customizable fields`}>
          {product.customizableFields.map((field) => (
            <li key={field}>{formatCustomizableField(field)}</li>
          ))}
        </ul>
        <Link
          className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
          href={`/start?template=${product.slug}`}
        >
          {product.slug === "graduation-water-bottle-label"
            ? "Create bottle label"
            : product.slug === "graduation-round-juice-sticker"
              ? "Create round sticker"
              : "Start this product"}
        </Link>
      </CardContent>
    </Card>
  );
}

function formatCustomizableField(field: string) {
  const labels: Record<string, string> = {
    graduate_name: "Graduate name",
    school_name: "School or class",
    graduation_year: "Graduation year",
    color_theme: "Color theme",
    optional_photo: "Optional photo",
    short_message: "Short message"
  };

  return labels[field] ?? field.replaceAll("_", " ");
}
