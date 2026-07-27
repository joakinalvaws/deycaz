import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { CategoryTile } from "@/components/CategoryTile";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

const title = "Catálogo";
const description =
  "Explora nuestro catálogo de decants: nicho, diseñador, árabes, exclusivos y damas. Envío a todo el Perú.";

// openGraph/twitter se repiten acá (no solo title/description) porque
// definir `openGraph` reemplaza TODO el objeto heredado del layout raíz,
// imagen incluida — sin esto la página quedaría compartiéndose sin imagen.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/catalogo" },
  openGraph: { title, description, url: "/catalogo", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
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
