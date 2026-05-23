import Link from "next/link";
import { TemplatePreviewImage } from "@/components/template-preview-image";
import { Card, CardContent } from "@/components/ui/card";
import {
  categoryLabels,
  formatPhotoCountRange,
  formatTemplateSize,
  productTypeLabels,
  sheetSizeLabels
} from "@/lib/templates";
import type { TemplateSeed } from "@/types/templates";

type TemplateCardProps = {
  template: TemplateSeed;
};

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="printili-template-card group">
      <Link className="focus-ring group block" href={`/template/${template.slug}`}>
        <div className="printili-template-card__media">
          <TemplatePreviewImage
            src={template.previewImage}
            alt={template.previewAlt}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="printili-template-card__badge printili-template-card__badge--size">
            {sheetSizeLabels[template.sheetSize]}
          </div>
          {template.priceLabel ? (
            <div className="printili-template-card__badge printili-template-card__badge--price">
              {template.priceLabel}
            </div>
          ) : null}
          <div className="printili-template-card__veil" />
        </div>
      </Link>

      <CardContent className="printili-template-card__body">
        <div className="printili-template-card__eyebrow">
          <span>{categoryLabels[template.categoryId]}</span>
          <span aria-hidden="true">/</span>
          <span>{productTypeLabels[template.productType]}</span>
        </div>
        <h2>
          <Link className="focus-ring" href={`/template/${template.slug}`}>
            {template.name}
          </Link>
        </h2>
        <p>{template.description}</p>

        <dl>
          <div>
            <dt>Product</dt>
            <dd>{productTypeLabels[template.productType]}</dd>
          </div>
          <div>
            <dt>Photos</dt>
            <dd>{formatPhotoCountRange(template.minPhotos, template.maxPhotos)}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{formatTemplateSize(template)}</dd>
          </div>
        </dl>

        <div
          className="printili-template-card__best-for"
          aria-label={`${template.name} is best for`}
        >
          {template.bestFor.slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <Link
          className="focus-ring printili-template-card__cta"
          href={`/start?template=${template.slug}`}
        >
          {template.ctaLabel ?? "Use this design"}
        </Link>
      </CardContent>
    </Card>
  );
}
