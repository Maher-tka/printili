import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { footerNavigation } from "@/lib/public-navigation";

const categories = [
  {
    href: "/polaroid-prints",
    image: "/printili/cat-polaroids.webp",
    imagePosition: "center center",
    title: "Polaroid Prints",
    description: "Retro prints, real feels. Perfectly you.",
    icon: "camera"
  },
  {
    href: "/birthday-number-collage",
    image: "/printili/cat-birthday.webp",
    imagePosition: "center center",
    title: "Birthday Number Collage",
    description: "Turn every age into a story worth framing.",
    icon: "number"
  },
  {
    href: "/wall-frames",
    image: "/printili/cat-wall-frames.webp",
    imagePosition: "center center",
    title: "Wall Frames",
    description: "Timeless frames for timeless memories.",
    icon: "frame"
  },
  {
    href: "/photo-books",
    image: "/printili/cat-photo-books.webp",
    imagePosition: "center center",
    title: "Photo Books",
    description: "Your story, bound beautifully.",
    icon: "book"
  },
  {
    href: "/photo-collages",
    image: "/printili/cat-photo-collages.webp",
    imagePosition: "center center",
    title: "Photo Collages",
    description: "Bring your best moments together.",
    icon: "collage"
  },
  {
    href: "/canvas-prints",
    image: "/printili/cat-canvas-prints.webp",
    imagePosition: "center center",
    title: "Canvas Prints",
    description: "Gallery-quality prints that inspire.",
    icon: "landscape"
  },
  {
    href: "/personalized-gifts",
    image: "/printili/cat-personalized-gifts.webp",
    imagePosition: "center center",
    title: "Personalized Gifts",
    titleLines: ["Personalized", "Gifts"],
    description: "Thoughtful gifts, made personal.",
    icon: "gift",
    compactTitle: true
  },
  {
    href: "/mugs",
    image: "/printili/cat-mugs.webp",
    imagePosition: "center center",
    title: "Mugs",
    description: "Memories that warm every sip.",
    icon: "mug"
  },
  {
    href: "/gift-cards",
    image: "/printili/cat-gift-cards.webp",
    imagePosition: "center center",
    title: "Gift Cards",
    description: "A perfect gift for every occasion.",
    icon: "card"
  },
  {
    href: "/wedding-prints",
    image: "/printili/cat-wedding-prints.webp",
    imagePosition: "center center",
    title: "Wedding Prints",
    description: "Celebrate love with timeless keepsakes.",
    icon: "calendar"
  },
  {
    href: "/baby-collages",
    image: "/printili/cat-baby-collages.webp",
    imagePosition: "center center",
    title: "Baby Collages",
    description: "Tiny moments, forever cherished.",
    icon: "baby"
  },
  {
    href: "/family-albums",
    image: "/printili/cat-family-albums.webp",
    imagePosition: "center center",
    title: "Family Albums",
    description: "Your family story, beautifully preserved.",
    icon: "album"
  },
  {
    href: "/categories/graduation",
    image: "/printili/cat-graduation-v2.webp",
    imagePosition: "center center",
    title: "Graduation",
    description: "Custom labels and stickers for graduation parties.",
    icon: "graduation"
  }
];

const benefits = [
  {
    icon: "ribbon",
    title: "Premium Quality Prints",
    lines: ["Museum-grade printing", "for lasting beauty."]
  },
  {
    icon: "gift",
    title: "Made with Care",
    lines: ["Thoughtfully crafted", "for every detail."]
  },
  {
    icon: "leaf",
    title: "Sustainable Choices",
    lines: ["Eco-friendly materials", "for a better tomorrow."]
  },
  {
    icon: "lock",
    title: "Secure & Easy",
    lines: ["Your memories, safe", "and delivered with care."]
  },
  {
    icon: "sun",
    title: "Happiness Guaranteed",
    lines: ["We're here to make", "you smile."]
  }
];

const memories = [
  {
    image: "/printili/memory-decorate-space-hq.webp",
    title: "Decorate your space"
  },
  {
    image: "/printili/memory-relive-days-hq.webp",
    title: "Relive your favorite days"
  },
  {
    image: "/printili/memory-gift-heart-hq.webp",
    title: "Gift from the heart"
  },
  {
    image: "/printili/memory-cherish-moment-hq.webp",
    title: "Cherish every moment"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    quote: "Printili turned our favorite memories into beautiful keepsakes. The quality is exceptional!"
  },
  {
    name: "James & Priya",
    quote: "The perfect gift for our anniversary! Thoughtful, personal, and absolutely stunning!"
  },
  {
    name: "Emily R.",
    quote: "From ordering to delivery, everything was seamless. We'll cherish these forever!"
  }
];

function HeartMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 8.8c0 4.8-8 10.2-8 10.2S4 13.6 4 8.8C4 6.2 5.8 4 8.4 4c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18.2 4 20 6.2 20 8.8Z" />
    </svg>
  );
}

function BenefitIcon({ type }: { type: string }) {
  if (type === "gift") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 10h16v10H4V10Zm0 0h16V7H4v3Zm8-3v13M8 7c-2.3 0-3-4 0-4 1.7 0 3 4 4 4m4 0c2.3 0 3-4 0-4-1.7 0-3 4-4 4" />
      </svg>
    );
  }

  if (type === "leaf") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M19.5 4.5C10 4.5 5 10.2 5 19.5c8.6.4 14.5-4.7 14.5-15Z" />
        <path d="M5 19.5c2.5-3.7 5.6-6.5 9.5-8.5" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="11" rx="2" width="13" x="5.5" y="9" />
        <path d="M8.5 9V6.7a3.5 3.5 0 0 1 7 0V9" />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m8 14-2 6 6-3 6 3-2-6" />
      <circle cx="12" cy="9" r="5" />
      <path d="m10.2 9 1.2 1.2 2.5-2.8" />
    </svg>
  );
}

function CategoryIcon({ type }: { type: string }) {
  if (type === "number") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M8.5 5.5 5 18.5M16 5.5l-3.5 13M4.5 10h14M3.5 15h14" />
      </svg>
    );
  }

  if (type === "frame") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="14" rx="2" width="16" x="4" y="5" />
        <path d="m7 16 3.7-4 2.7 2.8 2.6-3.1L19 16" />
      </svg>
    );
  }

  if (type === "book") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 6.5c2.6-.9 5.2-.7 8 1.1v11.2c-2.8-1.8-5.4-2-8-1.1V6.5Zm16 0c-2.6-.9-5.2-.7-8 1.1v11.2c2.8-1.8 5.4-2 8-1.1V6.5Z" />
      </svg>
    );
  }

  if (type === "collage") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="6" rx="1.5" width="6" x="4" y="4" />
        <rect height="6" rx="1.5" width="6" x="14" y="4" />
        <rect height="6" rx="1.5" width="6" x="4" y="14" />
        <rect height="6" rx="1.5" width="6" x="14" y="14" />
      </svg>
    );
  }

  if (type === "landscape") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="14" rx="2" width="16" x="4" y="5" />
        <path d="m7 16 3.8-4.2 2.5 2.6 2.1-2.3L19 16" />
        <circle cx="16.5" cy="9" r="1.2" />
      </svg>
    );
  }

  if (type === "gift") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 10h16v10H4V10Zm0 0h16V7H4v3Zm8-3v13M8 7c-2.3 0-3-4 0-4 1.7 0 3 4 4 4m4 0c2.3 0 3-4 0-4-1.7 0-3 4-4 4" />
      </svg>
    );
  }

  if (type === "mug") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 8h10v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
        <path d="M15 10h2a3 3 0 0 1 0 6h-2" />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="M3 10h18M7 16h4" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="15" rx="2" width="16" x="4" y="5" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (type === "baby") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="9" r="4" />
        <path d="M6.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M9 8h.1M15 8h.1" />
      </svg>
    );
  }

  if (type === "album") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="16" rx="2" width="14" x="5" y="4" />
        <path d="M9 4v16M12 9h4M12 13h4" />
      </svg>
    );
  }

  if (type === "graduation") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 12.5v3.2c0 1.6 2.2 3.3 5 3.3s5-1.7 5-3.3v-3.2M21 10v5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="15" rx="3" width="14" x="5" y="4.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M9 4.5 10 2h4l1 2.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function FinalHomepageSections() {
  return (
    <>
      <section
        className="printili-reference-categories"
        id="occasions"
        aria-label="Product categories"
      >
        <div className="printili-reference-grid">
          {categories.map((category) => (
            <Link
              className={`printili-category-card${category.compactTitle ? " printili-category-card--compact-title" : ""}`}
              href={category.href}
              key={category.title}
              aria-label={category.title}
            >
              <span className="printili-category-card__content">
                <span className="printili-category-card__icon">
                  <CategoryIcon type={category.icon} />
                </span>
                <span className="printili-category-card__copy">
                  <strong>
                    {category.titleLines
                      ? category.titleLines.map((line, index) => (
                          <span key={line}>
                            {index > 0 ? <br /> : null}
                            {line}
                          </span>
                        ))
                      : category.title}
                  </strong>
                  <em>{category.description}</em>
                </span>
              </span>
              <span
                className="printili-category-card__media"
                style={{ "--category-image-position": category.imagePosition } as CSSProperties}
              >
                <Image alt="" fill sizes="(min-width: 900px) 18vw, 50vw" src={category.image} />
              </span>
              <i>
                <ArrowRightIcon />
              </i>
            </Link>
          ))}
        </div>
      </section>

      <div className="printili-reference-live-body">
        <section
          className="printili-reference-benefits"
          id="benefits"
          aria-labelledby="benefits-heading"
        >
          <p>
            Why choose Printili <HeartMark />
          </p>
          <h2 id="benefits-heading">Because your memories deserve the best.</h2>

          <div>
            {benefits.map((benefit) => (
              <article key={benefit.title}>
                <BenefitIcon type={benefit.icon} />
                <span>
                  <strong>{benefit.title}</strong>
                  {benefit.lines.map((line) => (
                    <em key={line}>{line}</em>
                  ))}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          className="printili-reference-memories"
          id="memories"
          aria-labelledby="memories-heading"
        >
          <div>
            <p>
              Made to be cherished <HeartMark />
            </p>
            <h2 id="memories-heading">Memories that live beautifully.</h2>
            <span>
              From everyday moments to once-in-a-lifetime milestones, Printili helps you turn them
              into keepsakes you&apos;ll treasure forever.
            </span>
            <Link href="/start">Start Your Story</Link>
          </div>

          {memories.map((memory) => (
            <figure key={memory.title}>
              <Image
                alt={memory.title}
                height={178}
                loading="eager"
                quality={100}
                sizes="(min-width: 1280px) 18vw, 25vw"
                src={memory.image}
                width={193}
              />
              <figcaption>{memory.title}</figcaption>
            </figure>
          ))}
        </section>

        <section className="printili-reference-stories" aria-labelledby="stories-heading">
          <div>
            <p>
              Loved by thousands <HeartMark />
            </p>
            <h2 id="stories-heading">Real stories. Real smiles.</h2>

            <div>
              {testimonials.map((testimonial) => (
                <article key={testimonial.name}>
                  <strong>★★★★★</strong>
                  <blockquote>{testimonial.quote}</blockquote>
                  <span>{testimonial.name}</span>
                </article>
              ))}
            </div>
          </div>

          <Image
            alt="Heart-shaped photo wall above a bed with warm lights"
            height={174}
            loading="eager"
            quality={100}
            sizes="(min-width: 1280px) 39vw, 50vw"
            src="/printili/story-real-smiles-wide-hq.webp"
            width={357}
          />
        </section>

        <section className="printili-reference-newsletter" aria-label="Newsletter signup">
          <div>
            <strong>Stay inspired. Get special offers.</strong>
            <span>Join our community and never miss a memory.</span>
          </div>

          <form action="/newsletter" method="get">
            <label htmlFor="email" className="sr-only">
              Enter your email
            </label>
            <input id="email" name="email" placeholder="Enter your email" type="email" />
            <button type="submit">Subscribe</button>
          </form>

          <Image alt="" height={46} src="/printili/newsletter-photos.png" width={112} />
        </section>

        <footer className="printili-reference-footer">
          <div className="printili-reference-brand">
            <strong>
              Printili <HeartMark />
            </strong>
            <span>Turning your moments into timeless keepsakes.</span>
            <em>◎ ◎ ◎</em>
          </div>

          <div className="printili-reference-links">
            <nav aria-label="Shop">
              <strong>Shop</strong>
              {footerNavigation.shop.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Occasions">
              <strong>Occasions</strong>
              {footerNavigation.occasions.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Help">
              <strong>Help</strong>
              {footerNavigation.help.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Company">
              <strong>Company</strong>
              {footerNavigation.company.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <aside>
            <strong>Secure payments</strong>
            <span>Your information is safe with us.</span>
            <em>VISA · MC · AMEX · PayPal · Apple Pay</em>
          </aside>

          <small>© 2026 Printili. All rights reserved.</small>
        </footer>
      </div>
    </>
  );
}
