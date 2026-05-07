import Image from "next/image";
import Link from "next/link";
import type { CategorySeed } from "@/types/templates";
import { Card, CardContent } from "@/components/ui/card";

type CategoryPreviewCardProps = {
  category: CategorySeed;
};

export function CategoryPreviewCard({ category }: CategoryPreviewCardProps) {
  return (
    <Link
      className="focus-ring block rounded-[var(--radius-card)]"
      href={`/templates/${category.slug}`}
    >
      <Card className="group h-full overflow-hidden bg-paper/95 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgb(45_41_38_/_0.16)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
          <Image
            src={category.image}
            alt={category.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/38 to-transparent" />
        </div>
        <CardContent className="grid min-h-28 grid-cols-[1fr_auto] items-end gap-3 p-5">
          <div>
            <h3 className="font-display text-2xl leading-tight">{category.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-charcoal-soft">
              {category.description}
            </p>
          </div>
          <span
            className="mb-1 flex size-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-cream text-lg text-charcoal transition group-hover:bg-charcoal group-hover:text-paper"
            aria-hidden="true"
          >
            &#8594;
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
