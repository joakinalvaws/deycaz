import { createClient } from "@/lib/supabase/client";
import type { Category } from "../types";

export type CategoryInput = {
  slug: string;
  name: string;
  subtitle?: string | null;
  desde?: number | null;
  sort_order: number;
};

export async function listCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(slug: string, input: Partial<CategoryInput>): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").update(input).eq("slug", slug).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(slug: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw error;
}
