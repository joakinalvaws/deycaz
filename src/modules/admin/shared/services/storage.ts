import { createClient } from "@/lib/supabase/client";

/** Buckets públicos de la tienda. Están separados a propósito: las fotos de
 * producto son varias por producto (principal + por tamaño + galería) y las
 * de categoría son una sola que se reemplaza a sí misma, así que el borrado
 * y la limpieza no se parecen en nada. */
export type PublicBucket = "product-images" | "category-images";

/** El nombre original del archivo va dentro de la ruta de Storage, y ahí un
 * espacio, una tilde o un `/` terminan en URLs raras o rutas partidas. Se
 * normaliza a algo plano y se corta, que el prefijo UUID ya garantiza que
 * sea único. */
export function safeFileName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return normalized.slice(-60) || "imagen";
}

/** Ruta dentro del bucket a partir de la URL pública guardada en la fila —
 * es lo único que tenemos para poder borrar el archivo, porque las tablas
 * guardan la URL completa y no el path. */
export function storagePathFromPublicUrl(bucket: PublicBucket, url: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

/** Sube el archivo y devuelve su URL pública. */
export async function uploadToBucket(bucket: PublicBucket, path: string, file: File): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/** Borra el archivo del bucket. Nunca tira: si el objeto ya no está (o la
 * URL es de otro lado), el borrado de la fila igual tiene que completarse —
 * un huérfano en Storage es molesto, una imagen que no se puede borrar del
 * admin lo es más. */
export async function removeStorageObject(bucket: PublicBucket, url: string): Promise<void> {
  const path = storagePathFromPublicUrl(bucket, url);
  if (!path) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("No se pudo borrar la imagen del bucket:", bucket, path, error.message);
}
