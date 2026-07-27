import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Toaster } from "@/components/ui/sonner";
import { getCategories, getProductSearchIndex } from "@/lib/data";

// Catálogo cambia poco minuto a minuto — servir HTML cacheado (ISR) en vez
// de re-renderizar en cada request es mucho más rápido y más amigable con
// los bots de búsqueda. `place_order` siempre recalcula precios en el
// servidor, así que unos minutos de caché acá nunca afectan lo que se cobra.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Solo el índice de búsqueda (id/nombre/precio), no el catálogo entero:
  // este layout envuelve todas las páginas, así que lo que se le pase al
  // header viaja en el RSC de cada una.
  const [products, categories] = await Promise.all([getProductSearchIndex(), getCategories()]);

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
      <Toaster />
    </CartProvider>
  );
}
