import { createClient } from "@/lib/supabase/server";
import { CategoriesPageClient } from "./CategoriesPageClient";
import type { Category } from "@/modules/admin/categories/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");

  return <CategoriesPageClient initialCategories={(data ?? []) as Category[]} />;
}
