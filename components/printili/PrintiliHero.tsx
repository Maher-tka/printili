"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { featuredTemplates } from "@/data/seed-templates";

const heroPhotoSlugs = [
  "couple-heart-collage",
  "family-memory-poster",
  "mother-father-gift-poster",
  "wedding-welcome-poster",
  "couple-love-poster"
];

const baseHeroPhotos = heroPhotoSlugs
  .map((slug) => featuredTemplates.find((template) => template.slug === slug))
  .filter((template): template is (typeof featuredTemplates)[number] => Boolean(template));

const heroPhotos = [
  ...baseHeroPhotos,
  ...baseHeroPhotos.slice(0, 1).map((template, index) => ({
    ...template,
    id: `${template.id}-hero-repeat-${index}`,
    slug: `${template.slug}-hero-repeat-${index}`
  }))
];
const heroTiles = Array.from({ length: 18 }, (_, index) => heroPhotos[index % heroPhotos.length]);
const heartTiles = Array.from({ length: 42 }, (_, index) => heroPhotos[index % heroPhotos.length]);

const trustStats = [
  { value: "01", label: "Premium print finish" },
  { value: "02", label: "WhatsApp confirmation" },
  { value: "03", label: "Delivered to your door" }
];

const startPositions = [
  { x: -150, y: -88, z: 120, r: -17, s: 0.9 },
  { x: -58, y: -145, z: 160, r: 11, s: 0.82 },
  { x: 40, y: -72, z: 110, r: -7, s: 0.86 },
  { x: -112, y: 22, z: 145, r: 13, s: 0.78 },
  { x: 84, y: 32, z: 95, r: -12, s: 0.82 },
  { x: -12, y: 96, z: 130, r: 8, s: 0.76 }
];

const endPositions = [
  { x: 158, y: -108, z: 20, r: -2, s: 0.64 },
  { x: 230, y: -75, z: 20, r: 3, s: 0.64 },
  { x: 158, y: -18, z: 20, r: 1, s: 0.64 },
  { x: 230, y: 20, z: 20, r: -2, s: 0.64 },
  { x: 158, y: 70, z: 20, r: 2, s: 0.64 },
  { x: 230, y: 108, z: 20, r: -1, s: 0.64 }
];

export function PrintiliHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;

    function updateProgress() {
      if (!sectionRef.current) {
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const range = Math.max(420, rect.height - window.innerHeight);
      const nextProgress = Math.min(1, Math.max(0, -rect.top / range));
      setProgress(Number(nextProgress.toFixed(3)));
    }

    function onScroll() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  const displayProgress = reducedMotion ? 1 : Math.min(1, 0.42 + progress * 0.58);
  const easedProgress = easeInOut(displayProgress);
  const flightProgress = 0.1 + easedProgress * 0.72;
  const settleProgress = 0.58 + easedProgress * 0.42;
  const heartProgress = reducedMotion ? 1 : Math.min(1, 0.68 + easedProgress * 0.32);

  return (
    <section ref={sectionRef} className="printili-hero" aria-labelledby="printili-hero-title">
      <div className="printili-hero__sticky">
        <PrintiliNav />

        <div className="printili-shell printili-hero-grid">
          <div className="printili-hero-copy relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(199_163_95_/_0.28)] bg-white/56 px-4 py-2 text-xs font-bold text-charcoal-soft shadow-[0_12px_28px_rgb(45_41_38_/_0.07)] backdrop-blur">
              <span className="text-rose" aria-hidden="true">
                &hearts;
              </span>
              Made with love. Printed to last.
            </div>

            <h1
              id="printili-hero-title"
              className="mt-5 font-display text-[clamp(2.5rem,3.45vw,3.75rem)] leading-[0.94] text-charcoal"
            >
              <span className="printili-hero-line">Turn your phone</span>
              <br />
              <span className="printili-hero-line">
                photos into <span className="text-rose">timeless</span>
              </span>
              <br />
              printed gifts
            </h1>
            <p className="mt-3 max-w-md text-base leading-7 text-charcoal-soft md:text-lg">
              Beautiful templates. Smart tools. Premium prints. Delivered to your door.
            </p>
          </div>

          <div className="printili-hero-actions flex flex-col gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-13 items-center justify-center rounded-full bg-rose px-7 text-sm font-bold text-paper shadow-[0_18px_34px_rgb(191_127_134_/_0.32)] transition hover:bg-[rgb(172_98_106)]"
              href="#template-selector"
            >
              Create Yours Now
              <span className="ml-3" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link
              className="focus-ring inline-flex min-h-13 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-white/45 px-7 text-sm font-bold text-charcoal shadow-[0_14px_30px_rgb(45_41_38_/_0.06)] backdrop-blur transition hover:bg-paper"
              href="/templates"
            >
              Browse Templates
            </Link>
          </div>

          <div className="printili-hero-stats grid grid-cols-3 gap-3">
            {trustStats.map((stat) => (
              <div className="printili-stat" key={stat.label}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

          <div
            className="printili-hero-stage"
            aria-label="Phone photos become a framed collage gift"
          >
            <div className="printili-final-scene-image-wrap" aria-hidden="true">
              <Image
                src="/printili/hero-improved-clean.webp"
                alt=""
                fill
                unoptimized
                priority
                sizes="(min-width: 1900px) 96vw, (min-width: 900px) 88vw, 100vw"
                className="printili-final-scene-image"
              />
            </div>
            <div className="printili-stage-glow" aria-hidden="true" />
            <div className="printili-stage-arch" aria-hidden="true" />
            <div className="printili-stage-base" aria-hidden="true" />
            <svg
              className="printili-flow-trails"
              aria-hidden="true"
              viewBox="0 0 640 330"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="printili-trail-gold" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="26%" stopColor="rgba(255,255,255,0.92)" />
                  <stop offset="58%" stopColor="rgba(218,170,76,0.88)" />
                  <stop offset="82%" stopColor="rgba(255,245,218,0.72)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="printili-trail-glow" x="-20%" y="-80%" width="140%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M12 236 C132 88 266 38 430 116 C502 150 556 139 626 96"
                filter="url(#printili-trail-glow)"
                stroke="url(#printili-trail-gold)"
              />
              <path
                d="M18 264 C152 132 286 88 424 164 C502 207 560 187 628 142"
                filter="url(#printili-trail-glow)"
                stroke="rgba(255,255,255,0.9)"
              />
              <path
                d="M54 190 C178 62 318 58 456 130 C522 166 570 161 622 126"
                stroke="rgba(218,170,76,0.58)"
              />
              <circle cx="108" cy="214" r="3" />
              <circle cx="214" cy="104" r="2.5" />
              <circle cx="344" cy="104" r="2" />
              <circle cx="458" cy="151" r="2.5" />
              <circle cx="558" cy="139" r="2" />
            </svg>

            <div
              className="printili-phone"
              style={{
                transform: `translate3d(${lerp(0, -12, easedProgress)}px, ${lerp(0, 8, easedProgress)}px, 0) rotate(${lerp(-8, -12, easedProgress)}deg)`,
                opacity: lerp(1, 0.88, easedProgress)
              }}
            >
              <div className="printili-phone__speaker" />
              <div className="printili-phone__grid">
                {heroPhotos.slice(0, 4).map((template) => (
                  <Image
                    src={template.previewImage}
                    alt={`${template.name} phone thumbnail`}
                    width={72}
                    height={86}
                    className="h-full w-full rounded-[6px] object-cover"
                    key={template.id}
                  />
                ))}
              </div>
            </div>

            {heroPhotos.map((template, index) => (
              <FlyingPhoto
                index={index}
                key={template.id}
                progress={flightProgress}
                src={template.previewImage}
                alt={`${template.name} flying photo card`}
              />
            ))}

            <div
              className="printili-collage-sheet"
              style={{
                opacity: lerp(0.88, 1, settleProgress),
                transform: `translate3d(${lerp(14, 0, easedProgress)}px, ${lerp(8, 0, easedProgress)}px, 0) rotateY(${lerp(-15, -7, easedProgress)}deg) rotateZ(${lerp(4, 0, easedProgress)}deg) scale(${lerp(0.96, 1, easedProgress)})`
              }}
            >
              <div className="printili-collage-sheet__grid">
                {heroTiles.map((template, index) => (
                  <Image
                    src={template.previewImage}
                    alt={`${template.name} collage tile`}
                    width={110}
                    height={130}
                    className="h-full w-full rounded-[6px] object-cover"
                    key={`${template.slug}-sheet-${index}`}
                  />
                ))}
              </div>
            </div>

            <div
              className="printili-flow-arrow"
              style={{
                opacity: lerp(0.8, 1, settleProgress),
                transform: `translateX(${lerp(-10, 0, easedProgress)}px)`
              }}
              aria-hidden="true"
            />

            <div
              className="printili-frame"
              style={{
                opacity: lerp(0.95, 1, settleProgress),
                transform: `translate3d(${lerp(18, 0, easedProgress)}px, ${lerp(8, 0, easedProgress)}px, 0) rotateY(${lerp(-12, -7, easedProgress)}deg) rotateZ(${lerp(2, 0, easedProgress)}deg)`
              }}
            >
              <div className="printili-frame__inside">
                <div className="printili-heart-collage">
                  {heartTiles.map((template, index) => (
                    <span
                      className="printili-heart-collage__tile"
                      key={`${template.slug}-${index}`}
                      style={{
                        opacity: heartProgress >= (index + 1) / heartTiles.length ? 1 : 0.08,
                        transform: `scale(${
                          heartProgress >= (index + 1) / heartTiles.length ? 1 : 0.82
                        })`
                      }}
                    >
                      <Image
                        alt=""
                        className="h-full w-full rounded-[4px] object-cover"
                        height={48}
                        src={template.previewImage}
                        width={48}
                      />
                    </span>
                  ))}
                </div>
                <p>
                  All of our
                  <br />
                  <em>memories</em>
                  <span>make a beautiful life</span>
                </p>
              </div>
            </div>

            <div
              className="printili-gift"
              style={{
                opacity: lerp(0.96, 1, settleProgress),
                transform: `translate3d(${lerp(14, 0, easedProgress)}px, ${lerp(12, 0, easedProgress)}px, 0) scale(${lerp(0.98, 1, easedProgress)})`
              }}
            >
              <div className="printili-gift__bow" />
              <span>Made for you</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrintiliNav() {
  return (
    <header className="printili-shell flex items-center justify-between gap-5 py-4">
      <Link className="focus-ring rounded-sm" href="/" aria-label="Printili home">
        <span className="block font-display text-4xl leading-none text-charcoal">Printili</span>
        <span className="mt-1 block text-xs font-medium text-charcoal-soft">
          From phone photos to printed memories.
        </span>
      </Link>
      <nav
        className="hidden min-h-12 items-center gap-7 rounded-full border border-[rgb(199_163_95_/_0.18)] bg-white/58 px-8 text-sm font-bold text-charcoal-soft shadow-[0_18px_45px_rgb(45_41_38_/_0.08)] backdrop-blur lg:flex"
        aria-label="Printili navigation"
      >
        {[
          ["#occasions", "Occasions"],
          ["#template-selector", "Templates"],
          ["#how-it-works", "How It Works"],
          ["#editor-preview", "Editor"],
          ["#trust", "Trust"]
        ].map(([href, label]) => (
          <Link className="transition hover:text-charcoal" href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
      <Link
        className="hidden size-11 items-center justify-center rounded-full text-charcoal-soft transition hover:bg-white/70 hover:text-charcoal lg:inline-flex"
        href="/start"
        aria-label="Cart"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 5h2l2 11h10l2-8H8" />
          <circle cx="10" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
        </svg>
      </Link>
      <Link
        className="focus-ring hidden min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.28)] bg-white/52 px-5 text-sm font-bold text-charcoal shadow-[0_12px_28px_rgb(45_41_38_/_0.06)] lg:inline-flex"
        href="/admin"
      >
        Login
      </Link>
      <Link
        className="focus-ring inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-rose px-4 text-xs font-bold text-paper shadow-[0_16px_30px_rgb(191_127_134_/_0.28)] sm:px-5 sm:text-sm"
        href="#template-selector"
      >
        Create Yours Now
      </Link>
    </header>
  );
}

function FlyingPhoto({
  index,
  progress,
  src,
  alt
}: {
  index: number;
  progress: number;
  src: string;
  alt: string;
}) {
  const style = useMemo(() => {
    const start = startPositions[index];
    const end = endPositions[index];
    const curve = Math.sin(progress * Math.PI) * (index % 2 === 0 ? -54 : 42);
    const x = lerp(start.x, end.x, progress);
    const y = lerp(start.y, end.y, progress) + curve;
    const z = lerp(start.z, end.z, progress);
    const r = lerp(start.r, end.r, progress);
    const s = lerp(start.s, end.s, progress);

    return {
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotate(${r}deg) scale(${s})`,
      opacity: lerp(1, 0.12, Math.max(0, (progress - 0.74) / 0.26))
    };
  }, [index, progress]);

  return (
    <div className={`printili-flying-photo printili-flying-photo--${index + 1}`} style={style}>
      <Image
        src={src}
        alt={alt}
        width={150}
        height={130}
        className="h-full w-full object-cover"
        sizes="140px"
      />
    </div>
  );
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}
