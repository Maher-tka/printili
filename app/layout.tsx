import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://printable-photo-montage.example"),
  title: {
    default: "Printable Photo Montage Gifts",
    template: "%s | Printable Photo Montage Gifts"
  },
  description:
    "Create premium printable photo montage gifts for babies, couples, birthdays, weddings, families, and cuttable photo sheets.",
  openGraph: {
    title: "Printable Photo Montage Gifts",
    description:
      "Upload your photos, choose a beautiful montage design, and order a finished printed gift with cash on delivery.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#fbf4e8",
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
    <html lang="en">
      <body>
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
