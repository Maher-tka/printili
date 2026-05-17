import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://printable-photo-montage.example"),
  title: {
    default: "Printili - Custom Photo Montage Prints & Personalized Photo Gifts",
    template: "%s | Printili"
  },
  description:
    "Create custom printable photo montages for babies, couples, birthdays, weddings, families, and cuttable photo sheets.",
  openGraph: {
    title: "Printili - Custom Photo Montage Prints & Personalized Photo Gifts",
    description:
      "Upload your photos, choose a beautiful montage design, and order a finished printed gift with cash on delivery.",
    siteName: "Printili",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#f8f1e8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfairDisplay.variable}`}>
        <a
          href="#main-content"
          className="focus-ring fixed left-4 top-4 z-50 -translate-y-20 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-paper transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
