import { createClient } from "@/lib/supabase/client";
import {
  removeStorageObject,
  safeFileName,
  uploadToBucket,
} from "@/modules/admin/shared/services/storage";
import type { Category } from "../types";

export type CategoryInput = {
  slug: string;
  name: string;
  subtitle?: string | null;
  desde?: number | null;
  image_url?: string | null;
  sort_order: number;
};

const STORAGE_BUCKET = "category-images";

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

  // La URL se lee antes de borrar la fila: es el único puntero al archivo
  // en el bucket (mismo criterio que en el servicio de productos).
  const { data: existing } = await supabase
    .from("categories")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw error;

  if (existing?.image_url) await removeStorageObject(STORAGE_BUCKET, existing.image_url);
}

/** Sube (o reemplaza) la foto de fondo de una categoría y deja la URL en la
 * fila. A diferencia de los productos, acá siempre es una sola foto: la
 * anterior se borra del bucket antes de guardar la nueva. */
export async function setCategoryImage(slug: string, file: File): Promise<Category> {
  const supabase = createClient();

  const { data: previous } = await supabase
    .from("categories")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  const path = `${slug}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const publicUrl = await uploadToBucket(STORAGE_BUCKET, path, file);

  const { data, error } = await supabase
    .from("categories")
    .update({ image_url: publicUrl })
    .eq("slug", slug)
    .select()
    .single();
  if (error) throw error;

  // Recién después de que la fila apunta a la nueva: si el update falla, la
  // categoría sigue mostrando la foto vieja en vez de quedarse sin ninguna.
  if (previous?.image_url) await removeStorageObject(STORAGE_BUCKET, previous.image_url);

  return data;
}

/** Saca la foto de fondo (el tile vuelve al fondo oscuro liso). */
export async function removeCategoryImage(slug: string): Promise<Category> {
  const supabase = createClient();

  const { data: previous } = await supabase
    .from("categories")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  const { data, error } = await supabase
    .from("categories")
    .update({ image_url: null })
    .eq("slug", slug)
    .select()
    .single();
  if (error) throw error;

  if (previous?.image_url) await removeStorageObject(STORAGE_BUCKET, previous.image_url);

  return data;
}
