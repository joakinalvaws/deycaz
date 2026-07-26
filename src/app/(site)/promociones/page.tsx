import type { Metadata } from "next";
import { getPromoProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Promociones",
  description: "Ofertas por tiempo limitado en decants seleccionados. Precios especiales, cantidad limitada.",
};

export default async function PromocionesPage() {
  const products = await getPromoProducts();

  return (
    <>
      <div className="bg-foreground px-6 py-16 text-center md:px-10">
        <h1 className="font-display text-5xl tracking-wide text-white md:text-6xl">PROMOCIONES</h1>
        <p className="mt-2.5 text-[15px] text-[#c9c8c4]">
          Ofertas por tiempo limitado en decants seleccionados
        </p>
      </div>
      <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:pb-20">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="text-muted col-span-full py-10 text-center text-sm">
              No hay promociones activas por ahora.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
