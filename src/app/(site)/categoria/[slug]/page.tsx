import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories, getProductsByCategory, getPromoProducts } from "@/lib/data";
import { SortableProductGrid } from "@/components/SortableProductGrid";

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
  return {
    title: `Perfumes ${category.name}`,
    description: `Decants de ${category.name}${category.subtitle ? `: ${category.subtitle}` : ""}. Envío a todo el Perú, pago contra entrega.`,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = slug === "promos" ? await getPromoProducts() : await getProductsByCategory(slug);

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
      <h1 className="font-serif mb-5 text-[28px]">Perfumes {category.name}</h1>
      <SortableProductGrid products={products} />
    </section>
  );
}
