import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

const title = "Promociones";
const description = "Ofertas por tiempo limitado en decants seleccionados. Precios especiales, cantidad limitada.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/promociones" },
  openGraph: { title, description, url: "/promociones", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
};

export default async function PromocionesPage() {
  const products = await getProductsByCategory("promos");

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
