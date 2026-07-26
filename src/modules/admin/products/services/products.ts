import { createClient } from "@/lib/supabase/client";
import type { Product, ProductImage } from "../types";

export type ProductFilters = {
  onlyActive?: boolean;
  categorySlug?: string | null;
  search?: string;
};

export type ProductInput = {
  name: string;
  category_slug: string;
  price: number;
  price_3ml?: number | null;
  price_10ml?: number | null;
  price_full_bottle?: number | null;
  original_price?: number | null;
  badge?: string | null;
  best_seller: boolean;
  on_sale: boolean;
  active: boolean;
  description?: string | null;
};

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filters.onlyActive) query = query.eq("active", true);
  if (filters.categorySlug) query = query.eq("category_slug", filters.categorySlug);
  if (filters.search?.trim()) query = query.ilike("name", `%${filters.search.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// Imágenes (product_images) — hoy products.image_url sigue siendo la
// imagen que muestra el sitio público; se mantiene sincronizada acá al
// marcar una imagen como principal (ver setPrimaryImage).
// ============================================================

const STORAGE_BUCKET = "product-images";

export async function listProductImages(productId: number): Promise<ProductImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function uploadProductImage(productId: number, file: File): Promise<ProductImage> {
  const supabase = createClient();
  const path = `${productId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: publicUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductImage(imageId: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}

export async function reorderProductImages(images: { id: number; sort_order: number }[]): Promise<void> {
  const supabase = createClient();
  const { error } = await Promise.all(
    images.map((img) => supabase.from("product_images").update({ sort_order: img.sort_order }).eq("id", img.id)),
  ).then((results) => results.find((r) => r.error) ?? { error: null });
  if (error) throw error;
}

export async function setPrimaryImage(productId: number, imageId: number, url: string): Promise<void> {
  const supabase = createClient();
  const { error: unsetError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  if (unsetError) throw unsetError;

  const { error: setError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  if (setError) throw setError;

  const { error: syncError } = await supabase.from("products").update({ image_url: url }).eq("id", productId);
  if (syncError) throw syncError;
}
