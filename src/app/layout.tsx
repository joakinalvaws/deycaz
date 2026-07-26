import type { Metadata, Viewport } from "next";
import "./globals.css";
import { playfair, bebas, inter } from "@/lib/fonts";
import heroMasVendido from "@/assets/hero-mas-vendido.webp";

const SITE_URL = "https://deycaz.store";
const SITE_NAME = "DEYCAZ";
const SITE_DESCRIPTION =
  "Decants de perfumes 100% originales en todo el Perú. Envío 24-48h, pago contra entrega. Arma tu combo y ahorra.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Perfumes y Decants originales en Perú`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["decants Perú", "perfumes originales Perú", "decants Lima", "perfumes decants", "DEYCAZ"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Perfumes y Decants originales en Perú`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: heroMasVendido.src, width: heroMasVendido.width, height: heroMasVendido.height }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Perfumes y Decants originales en Perú`,
    description: SITE_DESCRIPTION,
    images: [heroMasVendido.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  sameAs: ["https://www.instagram.com/deycaz.pe/", "https://www.tiktok.com/@deycaz.pe"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${bebas.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
