
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pajara News — Wawasan, Ide, dan Inspirasi",
    template: "%s | Pajara News",
  },
  description:
    "Portal edukasi dan berita Pajara Studio. Temukan wawasan, tutorial, tips desain, teknologi, bisnis, dan kreativitas.",
  applicationName: "Pajara News",
  keywords: [
    "Pajara News",
    "Pajara Studio",
    "edukasi",
    "berita",
    "desain grafis",
    "kreativitas",
    "bisnis",
    "teknologi",
  ],
  openGraph: {
    type: "website",
    siteName: "Pajara News",
    title: "Pajara News — Wawasan, Ide, dan Inspirasi",
    description:
      "Berita, edukasi, dan inspirasi untuk terus bertumbuh di dunia digital.",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f4ee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
