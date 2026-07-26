import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductById } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { ProductDetail } from "@/components/ProductDetail";
import { formatPEN } from "@/lib/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  return { title: product ? `${product.name} — DEYCAZ` : "Producto — DEYCAZ" };
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProductById(productId);
  if (!product) notFound();

  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-2 md:gap-16 md:px-10">
      <div className="relative aspect-square w-full bg-cream">
        <ProductImage src={product.imageUrl} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" priority />
      </div>

      <div>
        <h1 className="mb-2.5 text-[28px] font-bold">{product.name}</h1>
        <p className="text-muted mb-5 text-[13px] tracking-wide uppercase">{product.categorySlug}</p>

        <ProductDetail
          productId={product.id}
          name={product.name}
          categorySlug={product.categorySlug}
          basePrice={product.price}
        />

        {related.length > 0 && (
          <div className="mt-9">
            <div className="text-muted mb-3.5 text-xs font-bold tracking-wide">TAMBIÉN TE PUEDE GUSTAR</div>
            <div className="grid grid-cols-4 gap-3.5">
              {related.map((r) => (
                <Link key={r.id} href={`/producto/${r.id}`} className="block">
                  <div className="relative mb-2 aspect-square w-full bg-cream">
                    <ProductImage src={r.imageUrl} alt={r.name} sizes="120px" />
                  </div>
                  <div className="text-xs font-medium">{r.name}</div>
                  <div className="text-muted-2 text-xs">S/. {formatPEN(r.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
