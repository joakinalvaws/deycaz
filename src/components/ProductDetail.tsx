"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { PRODUCT_PAGE_SIZES, getSizePrice, formatPEN, type Size } from "@/lib/pricing";

const GENERIC_DESCRIPTION =
  "Decant 100% original, envasado y sellado con cuidado. Ideal para descubrir tu fragancia antes de invertir en el frasco completo.";

const SIZE_LABEL: Record<Size, string> = {
  "3": "3ML",
  "5": "5ML",
  "10": "10ML",
  full: "FRASCO",
};

export function ProductDetail({
  productId,
  name,
  categorySlug,
  basePrice,
  price3ml,
  price10ml,
  priceFullBottle,
  description,
  size,
  onSizeChange,
}: {
  productId: number;
  name: string;
  categorySlug: string;
  basePrice: number;
  price3ml: number | null;
  price10ml: number | null;
  priceFullBottle: number | null;
  description: string | null;
  // Controlado desde `ProductView` (no estado propio) — el tamaño elegido
  // acá también decide qué foto se muestra en la columna de imagen.
  size: Size;
  onSizeChange: (size: Size) => void;
}) {
  const pricing = { price: basePrice, price3ml, price10ml, priceFullBottle };
  const availableSizes = useMemo(() => {
    const p = { price: basePrice, price3ml, price10ml, priceFullBottle };
    return PRODUCT_PAGE_SIZES.filter((sz) => getSizePrice(p, sz) !== null);
  }, [basePrice, price3ml, price10ml, priceFullBottle]);

  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const currentPrice = getSizePrice(pricing, size);

  return (
    <div>
      <div className="text-muted mb-2.5 text-[32px] font-extrabold">
        S/. {formatPEN(currentPrice ?? basePrice)}
      </div>

      <div className="text-muted mb-2.5 text-xs font-bold tracking-wide">TAMAÑO</div>
      <div className="mb-7 flex gap-3">
        {availableSizes.map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => onSizeChange(sz)}
            className={`flex-1 border py-4 text-center ${
              size === sz ? "border-foreground bg-foreground text-white" : "border-border-strong bg-white"
            }`}
          >
            <div className="text-[15px] font-extrabold">{SIZE_LABEL[sz]}</div>
            <div className="mt-1 text-[11px]">S/. {formatPEN(getSizePrice(pricing, sz) ?? 0)}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          if (currentPrice == null) return;
          addItem({
            productId,
            name,
            categorySlug,
            size,
            unitPrice: currentPrice,
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
