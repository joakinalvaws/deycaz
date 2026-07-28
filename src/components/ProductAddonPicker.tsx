"use client";

import { CheckIcon } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { ADDON_DISCOUNT, formatPEN } from "@/lib/pricing";
import type { ProductAddon } from "@/lib/types";

/** Sección "Combínalo y ahorra" del PDP de un producto en oferta — 1-2
 * productos recomendados (no excluyentes entre sí, se pueden tildar los
 * dos). Reusa el lenguaje visual de tarjeta-con-casillero ya establecido
 * en ComboBuilder.tsx, pero en filas apiladas en vez de grid: acá siempre
 * son 1-2 ítems, no un catálogo para explorar. */
export function ProductAddonPicker({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: ProductAddon[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="mb-7">
      <div className="text-muted mb-2.5 text-xs font-bold tracking-wide">COMBÍNALO Y AHORRA</div>
      <div className="flex flex-col gap-2.5">
        {addons.map((addon) => {
          const checked = selectedIds.has(addon.id);
          return (
            <label
              key={addon.id}
              className={`flex cursor-pointer items-center gap-3 border p-2.5 text-left transition-colors duration-150 ${
                checked ? "border-foreground bg-cream" : "border-border-strong bg-white"
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => onToggle(addon.id)} className="sr-only" />
              <div className="relative h-12 w-12 flex-none overflow-hidden bg-cream">
                <ProductImage src={addon.imageUrl} alt={addon.name} sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{addon.name}</div>
                <div className="text-[12px]">
                  <span className="text-success font-semibold">
                    + S/. {formatPEN(Math.max(0, addon.price - ADDON_DISCOUNT))}
                  </span>{" "}
                  <span className="text-muted-2 line-through">S/. {formatPEN(addon.price)}</span>
                </div>
              </div>
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                  checked ? "border-foreground bg-foreground" : "border-border-strong bg-white"
                }`}
              >
                {checked && <CheckIcon className="h-3 w-3 text-white" />}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
