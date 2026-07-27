import type { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { ComboBuilder } from "@/components/ComboBuilder";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

const title = "Arma tu Combo";
const description =
  "Elige tus decants favoritos entre más de 50 perfumes y ahorra automáticamente por cada decant adicional.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/combo" },
  openGraph: { title, description, url: "/combo", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
};

export default async function ComboPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  return <ComboBuilder categories={categories} products={products} />;
}
