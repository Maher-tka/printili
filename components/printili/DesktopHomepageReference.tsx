import Image from "next/image";
import Link from "next/link";

const hotspots = [
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--create",
    href: "/start",
    label: "Create Now"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--start",
    href: "/start",
    label: "Start Creating"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--explore",
    href: "/templates",
    label: "Explore Products"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--polaroids",
    href: "/templates/cut-sheets",
    label: "Polaroid Prints"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--birthday",
    href: "/templates/birthday",
    label: "Birthday Number Collage"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--frames",
    href: "/templates/custom-gifts",
    label: "Wall Frames"
  },
  {
    className: "printili-desktop-hotspot printili-desktop-hotspot--books",
    href: "/templates/custom-gifts",
    label: "Photo Books"
  }
];

export function DesktopHomepageReference() {
  return (
    <section className="printili-desktop-reference" aria-label="Printili desktop homepage">
      <Image
        alt="Printili homepage showing personalized photo gifts, category cards, customer stories, and footer."
        height={1672}
        priority
        src="/printili/homepage-final-reference.png"
        width={941}
      />

      {hotspots.map((hotspot) => (
        <Link
          aria-label={hotspot.label}
          className={hotspot.className}
          href={hotspot.href}
          key={hotspot.label}
        />
      ))}
    </section>
  );
}
