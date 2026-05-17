import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type PageAction = {
  href: string;
  label: string;
};

type PublicPageHeroProps = {
  eyebrow?: string;
  titleId?: string;
  title: ReactNode;
  intro: string;
  image: string;
  imageAlt: string;
  primaryAction?: PageAction;
  secondaryAction?: PageAction;
};

export function PublicPageHero({
  eyebrow,
  titleId,
  title,
  intro,
  image,
  imageAlt,
  primaryAction,
  secondaryAction
}: PublicPageHeroProps) {
  return (
    <section className="printili-public-hero" aria-label="Page introduction">
      <div className="printili-public-hero__copy">
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        <span>{intro}</span>
        {primaryAction || secondaryAction ? (
          <div>
            {primaryAction ? <Link href={primaryAction.href}>{primaryAction.label}</Link> : null}
            {secondaryAction ? <Link href={secondaryAction.href}>{secondaryAction.label}</Link> : null}
          </div>
        ) : null}
      </div>

      <figure className="printili-public-hero__media">
        <Image
          alt={imageAlt}
          fill
          priority
          quality={100}
          sizes="(min-width: 1200px) 38vw, 100vw"
          src={image}
        />
      </figure>
    </section>
  );
}
