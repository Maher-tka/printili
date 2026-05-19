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
        <p>{product.shape}</p>
        <h2>{product.name}</h2>
        <span>{product.description}</span>

        <dl>
          <div>
            <dt>Size</dt>
            <dd>{formatCatalogProductSize(product)}</dd>
          </div>
          <div>
            <dt>Customizable fields</dt>
            <dd>{product.customizableFields.length}</dd>
          </div>
        </dl>

        <ul aria-label={`${product.name} customizable fields`}>
          {product.customizableFields.map((field) => (
            <li key={field}>{field.replaceAll("_", " ")}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
