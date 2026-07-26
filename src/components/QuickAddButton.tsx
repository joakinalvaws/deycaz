"use client";

import { useCart } from "@/context/CartContext";

export function QuickAddButton({
  productId,
  name,
  categorySlug,
  basePrice,
  className,
}: {
  productId: number;
  name: string;
  categorySlug: string;
  basePrice: number;
  className?: string;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        addItem({
          productId,
          name,
          categorySlug,
          size: "5",
          unitPrice: basePrice,
          qty: 1,
        });
      }}
      className={
        className ??
        "bg-foreground px-3 py-2 text-[11px] font-bold text-white hover:opacity-90"
      }
    >
      AGREGAR
    </button>
  );
}
