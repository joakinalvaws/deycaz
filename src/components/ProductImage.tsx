import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes = "260px",
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
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
      className="object-cover"
    />
  );
}
