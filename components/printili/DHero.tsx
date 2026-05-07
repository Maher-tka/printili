"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { featuredTemplates } from "@/data/seed-templates";

const heroPhotos = featuredTemplates.slice(0, 6);

const trustStats = [
  { value: "10k+", label: "Happy customers" },
  { value: "4.9", label: "Customer rating" },
  { value: "300", label: "DPI print ready" }
];

const startPositions = [
  { x: -260, y: -118, z: 90, r: -14, s: 0.95 },
  { x: -188, y: 34, z: 130, r: 10, s: 0.86 },
  { x: -78, y: -168, z: 70, r: 7, s: 0.82 },
  { x: 48, y: -96, z: 145, r: -6, s: 0.9 },
  { x: -18, y: 96, z: 55, r: 12, s: 0.84 },
  { x: 112, y: 24, z: 110, r: -10, s: 0.78 }
];

const endPositions = [
  { x: 95, y: -112, z: 20, r: 0, s: 0.68 },
  { x: 188, y: -112, z: 20, r: 0, s: 0.68 },
  { x: 95, y: -12, z: 20, r: 0, s: 0.68 },
  { x: 188, y: -12, z: 20, r: 0, s: 0.68 },
  { x: 95, y: 88, z: 20, r: 0, s: 0.68 },
  { x: 188, y: 88, z: 20, r: 0, s: 0.68 }
];

export function DHero() {
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
      const range = Math.max(1, rect.height - window.innerHeight);
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

  const displayProgress = reducedMotion ? 0.72 : progress;
  const easedProgress = easeInOut(displayProgress);
  const giftProgress = Math.max(0, (easedProgress - 0.58) / 0.42);

  return (
    <section ref={sectionRef} className="printili-hero" aria-labelledby="printili-hero-title">
      <div className="printili-hero__sticky">
        <PrintiliNav />

        <div className="printili-shell grid min-h-[calc(100svh-5rem)] gap-8 py-8 md:grid-cols-[0.82fr_1.18fr] md:items-start md:py-10">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(199_163_95_/_0.28)] bg-white/56 px-4 py-2 text-xs font-bold text-charcoal-soft shadow-[0_12px_28px_rgb(45_41_38_/_0.07)] backdrop-blur">
              <span className="text-rose" aria-hidden="true">
                &hearts;
              </span>
              Made with love. Printed to last.
            </div>

            <h1
              id="printili-hero-title"
              className="mt-5 font-display text-[clamp(3.05rem,5.6vw,5.45rem)] leading-[0.96] text-charcoal"
            >
              Turn your phone photos into <span className="text-rose">timeless</span> printed gifts.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-charcoal-soft md:text-lg">
              Upload your memories, choose a moment, and let Printili create a beautiful printable
              montage for babies, couples, birthdays, weddings, and family gifts.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-8 grid grid-cols-3 gap-3">
              {trustStats.map((stat) => (
                <div className="printili-stat" key={stat.label}>
                  <span>{stat.value}</span>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="printili-hero-stage"
            aria-label="Phone photos become a framed collage gift"
          >
            <div
              className="printili-phone"
              style={{
                transform: `translate3d(${lerp(0, -32, easedProgress)}px, ${lerp(0, 22, easedProgress)}px, 0) rotate(${lerp(-8, -13, easedProgress)}deg)`,
                opacity: lerp(1, 0.7, easedProgress)
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
                progress={easedProgress}
                src={template.previewImage}
                alt={`${template.name} flying photo card`}
              />
            ))}

            <div
              className="printili-collage-sheet"
              style={{
                opacity: lerp(0.45, 1, easedProgress),
                transform: `translate3d(${lerp(28, 0, easedProgress)}px, ${lerp(26, 0, easedProgress)}px, 0) rotateY(${lerp(-18, -7, easedProgress)}deg) rotateZ(${lerp(4, 0, easedProgress)}deg) scale(${lerp(0.92, 1, easedProgress)})`
              }}
            >
              <div className="printili-collage-sheet__grid">
                {heroPhotos.map((template) => (
                  <Image
                    src={template.previewImage}
                    alt={`${template.name} collage tile`}
                    width={110}
                    height={130}
                    className="h-full w-full rounded-[6px] object-cover"
                    key={template.slug}
                  />
                ))}
              </div>
            </div>

            <div
              className="printili-frame"
              style={{
                opacity: lerp(0.28, 1, giftProgress),
                transform: `translate3d(${lerp(90, 0, giftProgress)}px, ${lerp(18, 0, giftProgress)}px, 0) rotateY(${lerp(-18, -9, giftProgress)}deg) rotateZ(${lerp(3, 0, giftProgress)}deg)`
              }}
            >
              <div className="printili-frame__inside">
                <div className="printili-heart-collage">
                  {heroPhotos.concat(heroPhotos.slice(0, 4)).map((template, index) => (
                    <Image
                      alt=""
                      className="h-full w-full rounded-[4px] object-cover"
                      height={48}
                      key={`${template.slug}-${index}`}
                      src={template.previewImage}
                      width={48}
                    />
                  ))}
                </div>
                <p>
                  All of our <em>memories</em>
                </p>
              </div>
            </div>

            <div
              className="printili-gift"
              style={{
                opacity: lerp(0.18, 1, giftProgress),
                transform: `translate3d(${lerp(80, 0, giftProgress)}px, ${lerp(50, 0, giftProgress)}px, 0) scale(${lerp(0.9, 1, giftProgress)})`
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
      <Link className="focus-ring rounded-sm" href="/D" aria-label="Printili home">
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
      <Image src={src} alt={alt} fill className="object-cover" sizes="140px" />
    </div>
  );
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}
