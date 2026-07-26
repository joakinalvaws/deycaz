"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { SIZES, priceForSize, formatPEN, type Size } from "@/lib/pricing";

const GENERIC_DESCRIPTION =
  "Decant 100% original, envasado y sellado con cuidado. Ideal para descubrir tu fragancia antes de invertir en el frasco completo.";

export function ProductDetail({
  productId,
  name,
  categorySlug,
  basePrice,
  description,
}: {
  productId: number;
  name: string;
  categorySlug: string;
  basePrice: number;
  description: string | null;
}) {
  const [size, setSize] = useState<Size>("5");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  return (
    <div>
      <div className="text-muted mb-2.5 text-[32px] font-extrabold">
        S/. {formatPEN(priceForSize(basePrice, size))}.00
      </div>

      <div className="text-muted mb-2.5 text-xs font-bold tracking-wide">TAMAÑO</div>
      <div className="mb-7 flex gap-3">
        {SIZES.map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => setSize(sz)}
            className={`flex-1 border py-4 text-center ${
              size === sz ? "border-foreground bg-foreground text-white" : "border-border-strong bg-white"
            }`}
          >
            <div className="text-[15px] font-extrabold">{sz}ML</div>
            <div className="mt-1 text-[11px]">S/. {formatPEN(priceForSize(basePrice, sz))}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          addItem({
            productId,
            name,
            categorySlug,
            size,
            unitPrice: priceForSize(basePrice, size),
            qty: 1,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="mb-9 w-full bg-foreground py-4.5 text-sm font-bold tracking-wide text-white"
      >
        {added ? "AGREGADO ✓" : "AGREGAR AL CARRITO"}
      </button>

      <p className="text-muted border-t border-border pt-6 text-sm leading-relaxed">
        {description || GENERIC_DESCRIPTION}
      </p>
    </div>
  );
}
