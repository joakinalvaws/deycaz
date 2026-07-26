import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { getAllProducts, getCategories } from "@/lib/data";

// Catálogo cambia poco minuto a minuto — servir HTML cacheado (ISR) en vez
// de re-renderizar en cada request es mucho más rápido y más amigable con
// los bots de búsqueda. `place_order` siempre recalcula precios en el
// servidor, así que unos minutos de caché acá nunca afectan lo que se cobra.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  return (
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
  );
}
