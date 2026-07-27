import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

export function CategoryTile({ category, caption }: { category: Category; caption: string }) {
  return (
    <Link href={`/categoria/${category.slug}`} className="group block">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-foreground">
        {/* Sin foto el tile queda con el fondo oscuro liso y el nombre
            encima. Antes acá iba <ProductImage>, que ante un src null
            dibuja el cartel "Foto próximamente" — y como ninguna categoría
            podía tener foto (la columna ni existía, ver migración 0013),
            ese cartel se veía en los 6 tiles de la home y de /catalogo,
            apenas tapado por el degradado. */}
        {category.imageUrl && (
          <div className="absolute inset-0 opacity-55 transition-opacity group-hover:opacity-70">
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 16vw, 45vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 to-black/5" />
        <span className="font-display absolute bottom-5 left-5 text-3xl tracking-wide text-white">
          {category.name.toUpperCase()}
        </span>
      </div>
      <div className="pt-2.5 text-sm text-[#3a3a38]">{caption}</div>
    </Link>
  );
}
