import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { QuickAddButton } from "./QuickAddButton";
import { formatPEN } from "@/lib/pricing";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const isPromo = product.onSale && product.originalPrice;

  return (
    <div>
      <Link
        href={`/producto/${product.id}`}
        className="relative mb-3.5 block aspect-square w-full overflow-hidden bg-cream"
      >
        {isPromo && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-foreground px-2.5 py-1 text-[11px] font-bold text-white">
            OFERTA
          </span>
        )}
        <ProductImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 260px, 45vw" priority={priority} />
      </Link>
      <Link href={`/producto/${product.id}`} className="mb-1 block text-sm font-medium hover:text-muted">
        {product.name}
      </Link>
      <div className="flex items-center justify-between">
        <span className="text-sm">
          <span className={isPromo ? "font-bold" : "text-muted"}>S/. {formatPEN(product.price)}</span>
          {isPromo && (
            <span className="text-muted-2 ml-1.5 line-through">
              S/. {formatPEN(product.originalPrice as number)}
            </span>
          )}
        </span>
        <QuickAddButton
          productId={product.id}
          name={product.name}
          categorySlug={product.categorySlug}
          basePrice={product.price}
        />
      </div>
    </div>
  );
}
