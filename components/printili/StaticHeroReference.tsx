import Image from "next/image";
import Link from "next/link";
import { primaryNavigation } from "@/lib/public-navigation";

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c.8-3.5 3-5.2 7-5.2s6.2 1.7 7 5.2" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.5 8.5h11l-.7 11h-9.6l-.7-11Z" />
      <path d="M9.5 9V7.4a2.5 2.5 0 0 1 5 0V9" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 8.8c0 4.8-8 10.2-8 10.2S4 13.6 4 8.8C4 6.2 5.8 4 8.4 4c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18.2 4 20 6.2 20 8.8Z" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m8 14-2 6 6-3 6 3-2-6" />
      <circle cx="12" cy="9" r="5" />
      <path d="m10.2 9 1.2 1.2 2.5-2.8" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M19.5 4.5C10 4.5 5 10.2 5 19.5c8.6.4 14.5-4.7 14.5-15Z" />
      <path d="M5 19.5c2.5-3.7 5.6-6.5 9.5-8.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="13" x="5.5" y="9" />
      <path d="M8.5 9V6.7a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function StaticHeroReference() {
  return (
    <>
      <section className="printili-static-hero" aria-label="Printili hero section">
        <Image
          alt="Printili homepage hero showing phone photos turning into printed memories, framed collage products, and a photo book."
          className="printili-static-hero__image"
          height={941}
          priority
          src="/printili/hero-clean-scene.png"
          width={1672}
        />

        <div className="printili-hero-overlay">
          <header className="printili-hero-nav">
            <Link className="printili-hero-brand" href="/">
              <span>Printili</span>
              <HeartIcon />
            </Link>

            <nav aria-label="Primary navigation" className="printili-hero-links">
              {primaryNavigation.map((item) => (
                <Link href={item.href} key={item.label}>
                  <span>{item.label}</span>
                  {item.label === "Products" || item.label === "Occasions" ? (
                    <ChevronDownIcon />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="printili-hero-tools">
              <Link aria-label="Search products" href="/templates">
                <SearchIcon />
              </Link>
              <Link aria-label="Customer account" href="/customer">
                <UserIcon />
              </Link>
              <Link aria-label="Cart" className="printili-hero-bag" href="/cart">
                <BagIcon />
                <em>2</em>
              </Link>
            </div>

            <Link className="printili-hero-create" href="/start">
              Create Now
            </Link>
          </header>

          <div className="printili-static-copy">
            <p>
              Made for memories <HeartIcon />
            </p>
            <h1>
              <span>Your moments.</span>
              <span>Our magic.</span>
              <em>Printed to last.</em>
            </h1>
            <b>
              Turn your favorite photos into timeless keepsakes.
              <br />
              From polaroids to wall art, photo books to collages-
              <br />
              beautifully printed, expertly crafted, and made to last.
            </b>
          </div>

          <div className="printili-static-actions">
            <Link className="printili-static-action printili-static-action--primary" href="/start">
              <span>Start Creating</span>
              <ArrowRightIcon />
            </Link>
            <Link className="printili-static-action printili-static-action--secondary" href="/templates">
              Explore Products
            </Link>
          </div>

          <div className="printili-static-proof" aria-label="Printili trust points">
            <span>
              <MedalIcon />
              Premium Quality
            </span>
            <span>
              <LeafIcon />
              Sustainable Materials
            </span>
            <span>
              <LockIcon />
              Secure &amp; Easy
            </span>
          </div>

          <div className="printili-static-social">
            <div aria-hidden="true">
              <span>S</span>
              <span>J</span>
              <span>E</span>
            </div>
            <p>
              Loved by 250,000+ customers
              <b>4.9 ★★★★★</b>
            </p>
          </div>
        </div>
      </section>

      <section className="printili-mobile-hero" aria-label="Printili mobile hero section">
        <div className="printili-mobile-hero__nav">
          <span className="font-display text-[1.7rem] leading-none text-charcoal">Printili</span>
          <Link className="printili-mobile-hero__nav-link" href="/start">
            Create Now
          </Link>
        </div>

        <div className="printili-mobile-hero__copy">
          <p>Your moments, beautifully printed</p>
          <h1>
            From your phone to forever <em>treasured</em>
          </h1>
          <span>
            Turn everyday photos into timeless keepsakes, thoughtful gifts, and prints made to be
            held.
          </span>
        </div>

        <div className="printili-mobile-hero__actions">
          <Link className="printili-mobile-hero__primary" href="/start">
            Start Creating
          </Link>
          <Link className="printili-mobile-hero__secondary" href="/templates">
            Browse Products
          </Link>
        </div>

        <div className="printili-mobile-hero__proof" aria-label="Printili trust points">
          <span>Premium Quality</span>
          <span>Made with Love</span>
          <span>100% Satisfaction</span>
        </div>

        <div className="printili-mobile-hero__media">
          <Image
            alt="Phone photos becoming printed gifts and framed memories."
            className="object-cover"
            fill
            priority
            sizes="(max-width: 899px) calc(100vw - 2rem), 1px"
            src="/printili/hero-clean-scene.png"
          />
        </div>
      </section>
    </>
  );
}
