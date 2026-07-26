import Link from "next/link";
import type { Category } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function CategoryTile({
  category,
  imageUrl,
  caption,
}: {
  category: Category;
  imageUrl: string | null;
  caption: string;
}) {
  return (
    <Link href={`/categoria/${category.slug}`} className="group block">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-foreground">
        <div className="absolute inset-0 opacity-55 transition-opacity group-hover:opacity-70">
          <ProductImage src={imageUrl} alt={category.name} sizes="(min-width: 1024px) 16vw, 45vw" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 to-black/5" />
        <span className="font-display absolute bottom-5 left-5 text-3xl tracking-wide text-white">
          {category.name.toUpperCase()}
        </span>
      </div>
      <div className="pt-2.5 text-sm text-[#3a3a38]">{caption}</div>
    </Link>
  );
}
