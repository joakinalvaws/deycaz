import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories, getProductsByCategory } from "@/lib/data";
import { SortableProductGrid } from "@/components/SortableProductGrid";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoría" };

  const title = `Perfumes ${category.name}`;
  const description = `Decants de ${category.name}${category.subtitle ? `: ${category.subtitle}` : ""}. Envío a todo el Perú, pago contra entrega.`;
  const canonicalPath = `/categoria/${category.slug}`;
  // Mismo motivo que en producto/[id]: definir `openGraph` reemplaza el
  // heredado del layout entero, así que hay que repetir la imagen (propia
  // o de respaldo) para no perderla.
  const image = category.imageUrl
    ? { url: category.imageUrl, width: 1200, height: 900 }
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, url: canonicalPath, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `Perfumes ${category.name}`,
        item: `${SITE_URL}/categoria/${category.slug}`,
      },
    ],
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="font-serif mb-5 text-[28px]">Perfumes {category.name}</h1>
      <SortableProductGrid products={products} />
    </section>
  );
}
