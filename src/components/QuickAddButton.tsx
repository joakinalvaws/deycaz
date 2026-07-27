"use client";

import { toast } from "sonner";
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
        // El carrito ya no se abre solo al agregar (ver CartContext.tsx) —
        // este toast es la única confirmación visible acá.
        toast.success("Producto agregado al carrito", { duration: 1500 });
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
