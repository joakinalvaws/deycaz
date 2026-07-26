import type { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { ComboBuilder } from "@/components/ComboBuilder";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Arma tu Combo",
  description: "Elige tus decants favoritos entre más de 50 perfumes y ahorra automáticamente por cada decant adicional.",
};

export default async function ComboPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  return <ComboBuilder categories={categories} products={products} />;
}
