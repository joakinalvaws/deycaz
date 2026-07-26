import type { Metadata } from "next";
import "./globals.css";
import { playfair, bebas, inter } from "@/lib/fonts";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { getAllProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DEYCAZ — Perfumes y Decants",
  description: "Decants 100% originales en todo el Perú. Envío 24-48h, pago contra entrega.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getAllProducts();

  return (
    <html lang="es" className={`${playfair.variable} ${bebas.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header products={products} />
          {/* padding-top reserva el espacio del header, que es "fixed" para
              poder flotar transparente sobre el hero de inicio (que cancela
              este padding con un margin-top negativo). */}
          <main className="flex-1" style={{ paddingTop: "var(--header-h)" }}>
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
