"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Un Server Action es un POST público contra la página que lo invoca: el ID
 * de la acción viaja en el bundle del cliente, así que cualquiera puede
 * dispararlo aunque nunca haya entrado al admin (ver
 * node_modules/next/dist/docs/01-app/02-guides/server-actions.md, sección
 * "Security": "Treat every action as an untrusted entry point"). Sin este
 * chequeo, un script externo podía invalidar el caché ISR del sitio entero
 * en loop y forzar regeneraciones — no filtra datos, pero quema lecturas de
 * Supabase e invocaciones de Vercel. `proxy.ts` no cubre esto porque las
 * acciones se postean contra la ruta pública (`/`, `/producto/…`), no
 * contra `/admin/*`.
 */
async function assertAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("No autorizado");
}

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
  await assertAdmin();
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/promociones");
  revalidatePath("/combo");
  if (productId != null) revalidatePath(`/producto/${productId}`);
  if (categorySlug) revalidatePath(`/categoria/${categorySlug}`);
}

export async function revalidateCategoryPaths(categorySlug?: string) {
  await assertAdmin();
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/combo");
  if (categorySlug) revalidatePath(`/categoria/${categorySlug}`);
}
