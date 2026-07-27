import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductById, getProductImages, getProductsByCategory } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { ProductView } from "@/components/ProductView";
import { formatPEN } from "@/lib/pricing";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Producto" };
  return {
    title: product.name,
    description: `${product.name} — decant 100% original desde S/. ${formatPEN(product.price)}. Envío a todo el Perú, pago contra entrega.`,
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProductById(productId);
  if (!product) notFound();

  // Los relacionados son siempre de la misma categoría, así que se pide esa
  // categoría y no el catálogo completo (que después se filtraba en
  // memoria para quedarse con 4).
  const [sameCategory, images] = await Promise.all([
    getProductsByCategory(product.categorySlug),
    getProductImages(productId),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.categorySlug,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `https://deycaz.store/producto/${product.id}`,
    },
  };

  return (
    <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-2 md:gap-16 md:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <ProductView
        productId={product.id}
        name={product.name}
        categorySlug={product.categorySlug}
        basePrice={product.price}
        price3ml={product.price3ml}
        price10ml={product.price10ml}
        priceFullBottle={product.priceFullBottle}
        description={product.description}
        fallbackImageUrl={product.imageUrl}
        images={images}
      >
        {related.length > 0 && (
          <div className="mt-9">
            <div className="text-muted mb-3.5 text-xs font-bold tracking-wide">TAMBIÉN TE PUEDE GUSTAR</div>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} href={`/producto/${r.id}`} className="block">
                  <div className="relative mb-2 aspect-square w-full bg-cream">
                    <ProductImage src={r.imageUrl} alt={r.name} sizes="(min-width: 640px) 140px, 40vw" />
                  </div>
                  <div className="text-xs font-medium">{r.name}</div>
                  <div className="text-muted-2 text-xs">S/. {formatPEN(r.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ProductView>
    </section>
  );
}
