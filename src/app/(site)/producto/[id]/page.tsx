import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getCategoryBySlug,
  getProductAddons,
  getProductById,
  getProductImages,
  getProductsByCategory,
} from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { ProductView } from "@/components/ProductView";
import { formatPEN } from "@/lib/pricing";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

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

  const description = `${product.name} — decant 100% original desde S/. ${formatPEN(product.price)}. Envío a todo el Perú, pago contra entrega.`;
  const canonicalPath = `/producto/${product.id}`;
  // Definir `openGraph` acá reemplaza TODO el objeto heredado del layout raíz
  // (Next hace merge superficial, no mezcla campo por campo) — sin este
  // bloque, compartir el link de un producto por WhatsApp mostraba el
  // título/imagen genéricos del sitio en vez del producto real, que es
  // justo el canal por el que se cierran los pedidos acá.
  const image = product.imageUrl
    ? { url: product.imageUrl, width: 1200, height: 1200 }
    : DEFAULT_OG_IMAGE;

  return {
    title: product.name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: product.name,
      description,
      url: canonicalPath,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image.url],
    },
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
  // memoria para quedarse con 4). `getCategoryBySlug` es solo para el
  // nombre legible del breadcrumb (el JSON-LD de categoría de abajo usaba
  // el slug crudo).
  const [sameCategory, images, category, addons] = await Promise.all([
    getProductsByCategory(product.categorySlug),
    getProductImages(productId),
    getCategoryBySlug(product.categorySlug),
    product.categorySlug === "promos" && (product.addonProductId1 != null || product.addonProductId2 != null)
      ? getProductAddons(product)
      : Promise.resolve([]),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: String(product.id),
    category: product.categorySlug,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/producto/${product.id}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: `Perfumes ${category.name}`,
              item: `${SITE_URL}/categoria/${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 3 : 2,
        name: product.name,
        item: `${SITE_URL}/producto/${product.id}`,
      },
    ],
  };

  return (
    // md:items-start: por defecto el grid estira ambas columnas a la altura
    // de la más alta (align-items: stretch). La columna de texto es mucho
    // más alta que la de la imagen (selector de tamaño, stepper, botones,
    // los dos desplegables) — sin este fix, ese estiramiento se colaba
    // hasta el <div aspect-square> de la imagen (los hijos de un flex
    // container también heredan stretch en el eje transversal por
    // defecto) y lo dejaba rectangular en vez de cuadrado, con la imagen
    // recortada de forma mucho más agresiva por object-cover — el "zoom"
    // que se veía en desktop. En mobile no pasaba porque ahí las dos
    // columnas son un solo grid-cols-1 (una debajo de la otra, no lado a
    // lado), no hay estiramiento cruzado entre ellas.
    //
    // max-w-[1400px] (antes 1200px) + grid-cols-[3fr_2fr] (antes 2 columnas
    // iguales): la imagen necesitaba más ancho — las fotos de promoción
    // muestran 3 productos en una sola toma, y a la mitad del ancho de
    // antes se apreciaban chicos. La columna de info se achica un poco
    // pero sigue siendo legible (~esa proporción es la misma que ya usa el
    // resto del sitio para dar más peso visual al contenido principal).
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[3fr_2fr] md:items-start md:gap-12 md:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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
        addons={addons}
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
