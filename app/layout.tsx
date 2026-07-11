import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TEPKİ — MMXVIII",
  description:
    "Tepki yeni albüm MMXVIII. Sefaköy'den Tiflis'e, Buenos Aires'e uzanan immersif bir anı defteri.",
  openGraph: {
    title: "TEPKİ — MMXVIII",
    description: "832 Yanyol'dan dünyaya. İmmersif albüm deneyimi.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${bebas.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
