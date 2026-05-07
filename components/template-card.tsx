import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  categoryLabels,
  formatPhotoCountRange,
  formatSheetSizeCm,
  productTypeLabels,
  sheetSizeLabels
} from "@/lib/templates";
import type { TemplateSeed } from "@/types/templates";

type TemplateCardProps = {
  template: TemplateSeed;
};

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-paper/95 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgb(45_41_38_/_0.16)]">
      <Link className="focus-ring group block" href={`/template/${template.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-strong">
          <Image
            src={template.previewImage}
            alt={template.previewAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute left-3 top-3 rounded-full bg-paper/92 px-3 py-1 text-xs font-semibold text-charcoal shadow-sm backdrop-blur">
            {sheetSizeLabels[template.sheetSize]}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/42 to-transparent" />
        </div>
      </Link>

      <CardContent className="flex grow flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.08em] text-champagne">
          <span>{categoryLabels[template.categoryId]}</span>
          <span aria-hidden="true">/</span>
          <span>{productTypeLabels[template.productType]}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold leading-snug">
          <Link
            className="focus-ring rounded-sm hover:text-rose"
            href={`/template/${template.slug}`}
          >
            {template.name}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-charcoal-soft">
          {template.description}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-semibold text-charcoal">Photos</dt>
            <dd className="mt-1 text-charcoal-soft">
              {formatPhotoCountRange(template.minPhotos, template.maxPhotos)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal">Size</dt>
            <dd className="mt-1 text-charcoal-soft">
              {formatSheetSizeCm(template.sheetSize, template.orientation)}
            </dd>
          </div>
        </dl>

        <Link
          className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
          href={`/template/${template.slug}`}
        >
          View Design
        </Link>
      </CardContent>
    </Card>
  );
}
