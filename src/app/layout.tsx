import type { Metadata, Viewport } from "next";
import "./globals.css";
import { playfair, bebas, inter } from "@/lib/fonts";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { getAllProducts, getCategories } from "@/lib/data";
import heroMasVendido from "@/assets/hero-mas-vendido.webp";

// Catálogo cambia poco minuto a minuto — servir HTML cacheado (ISR) en vez
// de re-renderizar en cada request es mucho más rápido y más amigable con
// los bots de búsqueda. `place_order` siempre recalcula precios en el
// servidor, así que unos minutos de caché acá nunca afectan lo que se cobra.
export const revalidate = 300;

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  return (
    <html lang="es" className={`${playfair.variable} ${bebas.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <Header products={products} categories={categories} />
          {/* pt-28/pt-24 reserva el espacio del header, que es "fixed" en
              todos los tamaños para poder flotar transparente sobre el hero
              de inicio (que cancela este padding con -mt-28/-mt-24). En
              mobile el header mide más (2 filas: fila principal + fila de
              navegación) que en desktop (1 fila), por eso el valor es
              distinto por breakpoint. */}
          <main className="flex-1 pt-28 lg:pt-24">{children}</main>
          <Footer />
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
