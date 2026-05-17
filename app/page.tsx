import type { Metadata } from "next";
import { FinalHomepageSections } from "@/components/printili/FinalHomepageSections";
import { StaticHeroReference } from "@/components/printili/StaticHeroReference";

const title = "Printili - Custom Photo Montage Prints & Personalized Photo Gifts";
const description =
  "Create custom printable photo montages for babies, couples, birthdays, weddings, and family gifts. Upload photos, preview your design, and receive A4/A3 printed gifts delivered to your door.";
const heroImage = {
  url: "/printili/hero-clean-scene.png",
  width: 1672,
  height: 941,
  alt: "Printili premium photo gift homepage hero"
};

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Printili",
    type: "website",
    images: [heroImage]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [heroImage.url]
  }
};

export default function Home() {
  return (
    <div className="printili-page printili-reference-page">
      <StaticHeroReference />
      <FinalHomepageSections />
    </div>
  );
}
