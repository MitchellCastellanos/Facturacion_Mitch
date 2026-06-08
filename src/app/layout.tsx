import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.appUrl),
  title: {
    default: BRAND.shopName,
    template: `%s · ${BRAND.shopName}`,
  },
  description: "Agencia de servicios web y software — GABAN Solutions, Montréal",
  alternates: {
    canonical: BRAND.appUrl,
  },
  openGraph: {
    title: BRAND.shopName,
    description: "Servicios web, software y facturación — GABAN Solutions",
    url: BRAND.appUrl,
    siteName: BRAND.shopName,
    images: [{ url: BRAND.logoPath, alt: BRAND.shopName }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
