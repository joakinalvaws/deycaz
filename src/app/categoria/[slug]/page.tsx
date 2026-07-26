import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategory, getPromoProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type Sort = "default" | "asc" | "desc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `Perfumes ${category.name} — DEYCAZ` : "Categoría — DEYCAZ" };
}

function sortProducts(products: Product[], sort: Sort) {
  if (sort === "asc") return [...products].sort((a, b) => a.price - b.price);
  if (sort === "desc") return [...products].sort((a, b) => b.price - a.price);
  return products;
}

function SortLink({
  slug,
  sort,
  active,
  label,
}: {
  slug: string;
  sort: Sort;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={sort === "default" ? `/categoria/${slug}` : `/categoria/${slug}?sort=${sort}`}
      className={`border px-3.5 py-2 text-xs font-semibold ${
        active ? "border-foreground bg-foreground text-white" : "border-border-strong bg-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort: rawSort } = await searchParams;
  const sort: Sort = rawSort === "asc" || rawSort === "desc" ? rawSort : "default";

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = sortProducts(
    slug === "promos" ? await getPromoProducts() : await getProductsByCategory(slug),
    sort,
  );

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
      <h1 className="font-serif mb-5 text-[28px]">Perfumes {category.name}</h1>
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <span className="text-muted text-[13px]">{products.length} artículos</span>
        <div className="flex gap-2.5">
          <SortLink slug={slug} sort="default" active={sort === "default"} label="RELEVANCIA" />
          <SortLink slug={slug} sort="asc" active={sort === "asc"} label="PRECIO ↑" />
          <SortLink slug={slug} sort="desc" active={sort === "desc"} label="PRECIO ↓" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="text-muted col-span-full py-10 text-center text-sm">
            Todavía no hay productos en esta categoría.
          </p>
        )}
      </div>
    </section>
  );
}
