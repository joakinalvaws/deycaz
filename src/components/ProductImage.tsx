import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes = "260px",
  priority = false,
  fit = "cover",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** "contain" para cajas muy altas (ej. imagen principal del PDP) donde
   * "cover" recortaría el frasco en vez de mostrarlo entero. */
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream">
        <span className="px-3 text-center text-[11px] font-medium tracking-wide text-muted-2">
          Foto próximamente
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={fit === "contain" ? "object-contain" : "object-cover"}
    />
  );
}
