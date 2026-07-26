import type { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { ComboBuilder } from "@/components/ComboBuilder";

export const metadata: Metadata = { title: "Arma tu Combo — DEYCAZ" };

export default async function ComboPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  return <ComboBuilder categories={categories} products={products} />;
}
