import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

export function CategoryTile({ category, caption }: { category: Category; caption: string }) {
  return (
    <Link href={`/categoria/${category.slug}`} className="group block">
      {/* Antes llevaba el nombre de la categoría superpuesto (placeholder
          de cuando el tile no tenía foto — ver migración 0013). Con la foto
          real puesta, ese rótulo sobraba: la propia imagen identifica la
          categoría y el caption de abajo ya dice el nombre. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-foreground">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 16vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="pt-2.5 text-sm text-[#3a3a38]">{caption}</div>
    </Link>
  );
}
