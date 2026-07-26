"use server";

import { revalidatePath } from "next/cache";

/**
 * El sitio público usa ISR (`revalidate = 300` en cada página, ver
 * src/app/(site)/*) para no pegarle a Supabase en cada visita — a propósito,
 * documentado desde antes de este panel. El costo es que un cambio hecho
 * fuera del admin (ej. directo en Supabase Studio) puede tardar hasta 5
 * minutos en verse. Para que los cambios hechos DESDE el admin se vean al
 * toque, cada mutación llama a esto en su `onSuccess` — nunca reemplaza el
 * ISR, solo lo adelanta cuando ya sabemos que algo cambió.
 */
export async function revalidateProductPaths(productId?: number, categorySlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/promociones");
  revalidatePath("/combo");
  if (productId != null) revalidatePath(`/producto/${productId}`);
  if (categorySlug) revalidatePath(`/categoria/${categorySlug}`);
}

export async function revalidateCategoryPaths(categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/combo");
  if (categorySlug) revalidatePath(`/categoria/${categorySlug}`);
}
