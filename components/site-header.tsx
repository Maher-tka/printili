"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/lib/public-navigation";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/D") {
    return null;
  }

  return (
    <header className="printili-site-header">
      <div className="printili-site-header__inner">
        <Link className="printili-site-header__brand" href="/" aria-label="Printili home">
          <span>Printili</span>
          <HeartIcon />
        </Link>

        <nav className="printili-site-header__nav" aria-label="Main navigation">
          {primaryNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="printili-site-header__tools">
          <Link aria-label="Search products" href="/templates">
            <SearchIcon />
          </Link>
          <Link aria-label="Customer account" href="/customer">
            <UserIcon />
          </Link>
          <Link aria-label="Cart" href="/cart">
            <BagIcon />
          </Link>
          <Link href="/start">Create Now</Link>
        </div>
      </div>
    </header>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 8.8c0 4.8-8 10.2-8 10.2S4 13.6 4 8.8C4 6.2 5.8 4 8.4 4c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18.2 4 20 6.2 20 8.8Z" />
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
