import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/seed-templates";

const occasions = [
  { categoryId: "baby", label: "Baby Memories", icon: "teddy" },
  { categoryId: "couple", label: "Couple Love", icon: "heart" },
  { categoryId: "birthday", label: "Birthday Special", icon: "cake" },
  { categoryId: "family", label: "Family Moments", icon: "family" },
  { categoryId: "wedding", label: "Wedding Prints", icon: "rings" },
  { categoryId: "custom", label: "Mother/Father Gifts", icon: "gift" },
  { categoryId: "cut_sheet", label: "Cuttable Photo Sheets", icon: "grid" }
];

export function OccasionCards() {
  return (
    <section className="printili-shell py-8 sm:py-10" aria-labelledby="occasion-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="occasion-heading" className="font-display text-3xl leading-tight text-charcoal">
            Shop by Occasion
          </h2>
          <p className="mt-2 text-sm leading-6 text-charcoal-soft">
            Choose the kind of memory first. Printili handles the layout and print size after.
          </p>
        </div>
        <Link className="hidden text-sm font-bold text-rose sm:inline-flex" href="/templates">
          View all templates &rarr;
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {occasions.map((occasion) => {
          const category = categories.find((item) => item.id === occasion.categoryId);

          if (!category) {
            return null;
          }

          return (
            <Link
              className="group overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.2)] bg-white/62 p-3 shadow-[0_14px_34px_rgb(45_41_38_/_0.07)] transition hover:-translate-y-1 hover:bg-paper hover:shadow-[0_18px_44px_rgb(45_41_38_/_0.12)]"
              href={`/templates/${category.slug}`}
              key={occasion.label}
            >
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[7px] bg-cream lg:hidden">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 180px, 50vw"
                />
              </div>
              <div className="flex min-h-24 flex-col items-center justify-center text-center">
                <OccasionIcon type={occasion.icon} />
                <h3 className="mt-3 text-sm font-extrabold leading-tight text-charcoal">
                  {occasion.label}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function OccasionIcon({ type }: { type: string }) {
  return (
    <span
      className="inline-flex size-10 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.28)] bg-cream text-rose"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        {type === "heart" ? (
          <path d="M12 20s-7-4.3-8.7-9.1C2.1 7.3 4.1 4.5 7.1 4.5c1.8 0 3.1 1 4.9 3 1.8-2 3.1-3 4.9-3 3 0 5 2.8 3.8 6.4C19 15.7 12 20 12 20Z" />
        ) : type === "cake" ? (
          <path d="M5 20h14v-8H5v8Zm2-8V9h10v3M9 9V6m6 3V6M8 4h2m4 0h2" />
        ) : type === "family" ? (
          <path d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c.4-4 2-6 4-6s3.6 2 4 6m2 0c.4-4 2-6 4-6s3.6 2 4 6" />
        ) : type === "rings" ? (
          <path d="M9 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6 0a5 5 0 1 0 0 10M9 9l3-4 3 4" />
        ) : type === "grid" ? (
          <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
        ) : type === "gift" ? (
          <path d="M4 10h16v10H4V10Zm0 0h16V7H4v3Zm8-3v13M8 7c-2.3 0-3-4 0-4 1.7 0 3 4 4 4m4 0c2.3 0 3-4 0-4-1.7 0-3 4-4 4" />
        ) : (
          <path d="M7 10a3 3 0 1 1 3-3m4 3a3 3 0 1 0 3-3M5 18c.5-3 2-5 4-5s3.5 2 4 5m-4-5c1-2 2-3 4-3s3.5 2 4 5" />
        )}
      </svg>
    </span>
  );
}
