// Resize/compresión client-side con <canvas> nativo antes de subir a
// Supabase Storage — sin agregar una librería nueva solo para esto.
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
}
