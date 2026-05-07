"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

const navItems = [
  { href: "/start", label: "Create" },
  { href: "/templates", label: "Templates" },
  { href: "/templates/baby", label: "Occasions" },
  { href: "/photo-montage-print", label: "How It Works" },
  { href: "/admin", label: "Admin" }
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/D") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(199_163_95_/_0.18)] bg-[#fffdf8]/88 backdrop-blur-xl">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4">
        <Link className="focus-ring rounded-sm" href="/" aria-label="Montage Atelier home">
          <span className="block font-display text-2xl font-bold leading-none">Montage</span>
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.32em] text-champagne">
            Atelier
          </span>
        </Link>
        <nav
          className="hidden items-center gap-6 text-sm font-semibold text-charcoal-soft lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              className="focus-ring rounded-sm transition hover:text-charcoal"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ButtonLink
          className="bg-rose text-paper hover:bg-[rgb(171_98_106)]"
          href="/start"
          size="sm"
        >
          Start Create Yours
        </ButtonLink>
      </div>
    </header>
  );
}
