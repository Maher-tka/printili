import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  categoryLabels,
  formatPhotoCountRange,
  formatSheetSizeCm,
  productTypeLabels,
} from "@/lib/templates";
import type { TemplateRecommendation } from "@/lib/template-recommender";

type RecommendationCardProps = {
  recommendation: TemplateRecommendation;
  guestToken: string;
};

export function RecommendationCard({ recommendation, guestToken }: RecommendationCardProps) {
  const { template } = recommendation;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link className="focus-ring group block" href={`/template/${template.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-strong">
          <Image
            src={template.previewImage}
            alt={template.previewAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold text-charcoal shadow-sm">
            {recommendation.label}
          </div>
          <div className="absolute bottom-3 right-3 rounded-full bg-charcoal px-3 py-1 text-xs font-semibold text-paper shadow-sm">
            {recommendation.matchScore}%
          </div>
        </div>
      </Link>

      <CardContent className="flex grow flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-charcoal-soft">
          <span>{categoryLabels[template.categoryId]}</span>
          <span aria-hidden="true">/</span>
          <span>{productTypeLabels[template.productType]}</span>
          <span aria-hidden="true">/</span>
          <span>{formatSheetSizeCm(template.sheetSize, template.orientation)}</span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug">{template.name}</h3>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          {formatPhotoCountRange(template.minPhotos, template.maxPhotos)}
        </p>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-charcoal-soft">
          {recommendation.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>

        <form
          action={`/api/projects/${guestToken}/template`}
          className="mt-auto pt-6"
          method="post"
        >
          <input name="templateSlug" type="hidden" value={template.slug} />
          <button
            className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)] disabled:cursor-not-allowed disabled:bg-charcoal-soft"
            disabled={!recommendation.canUse}
            type="submit"
          >
            {recommendation.canUse ? "Use this template" : "Needs more photos"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
