import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { CategoryTile } from "@/components/CategoryTile";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora nuestro catálogo de decants: nicho, diseñador, árabes, exclusivos y damas. Envío a todo el Perú.",
};

export default async function CatalogoPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
      <h1 className="font-serif mb-8 text-3xl">Catálogo</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryTile
            key={c.slug}
            category={c}
            caption={c.slug === "promos" ? "PROMOCIONES" : `Perfumes ${c.name}`}
          />
        ))}
      </div>
    </section>
  );
}
