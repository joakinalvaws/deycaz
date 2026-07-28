"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { PRODUCT_PAGE_SIZES, SPRAYS_BY_SIZE, getSizePrice, formatPEN, sizeLabel, type Size } from "@/lib/pricing";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";
import { ProductAddonPicker } from "@/components/ProductAddonPicker";
import type { ProductAddon } from "@/lib/types";

const NO_DESCRIPTION_FALLBACK = "Descripción disponible próximamente.";

// Texto fijo, igual para todos los productos — no depende de la base de
// datos, por eso vive acá como constante y no en el admin.
const SHIPPING_RETURNS_TEXT = `Envíos:
Realizamos envíos a todo el Perú.
Lima: delivery a domicilio.
Provincias: envíos mediante la agencia SHALOM, con código de seguimiento.
Los tiempos de entrega pueden variar según el destino y la agencia de transporte.

Retornos y Devoluciones:
Por tratarse de productos de uso personal, no aceptamos devoluciones si el pedido recibido corresponde correctamente a lo solicitado por el cliente.
En caso de existir algún error por nuestra parte, realizamos el cambio del producto de manera inmediata, asumiendo la solución correspondiente.`;

// Espeja MAX_QTY_PER_LINE de src/app/actions.ts (y su copia en la migración
// SQL de place_order) — sin este tope, el stepper permite armar una cantidad
// que el servidor va a rechazar igual, con un error mucho menos claro.
const MAX_QTY_PER_LINE = 50;

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
  onSale,
  addons,
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
  // "Combínalo y ahorra" — solo se muestra si onSale y hay al menos un addon.
  onSale: boolean;
  addons: ProductAddon[];
}) {
  const pricing = { price: basePrice, price3ml, price10ml, priceFullBottle };
  const availableSizes = useMemo(() => {
    const p = { price: basePrice, price3ml, price10ml, priceFullBottle };
    return PRODUCT_PAGE_SIZES.filter((sz) => getSizePrice(p, sz) !== null);
  }, [basePrice, price3ml, price10ml, priceFullBottle]);

  const [qty, setQty] = useState(1);
  // Un solo lock para los dos botones: ambos disparan el mismo addItems, y
  // un timer compartido evita una carrera si se clickea uno y después el
  // otro dentro de la ventana de 1.5s. El toast usa la misma duración para
  // que desaparezca justo cuando el botón se vuelve a habilitar.
  const [locked, setLocked] = useState(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
  const { addItems, openCheckout } = useCart();

  const currentPrice = getSizePrice(pricing, size);
  const addonsTotal = useMemo(
    () => addons.filter((a) => selectedAddonIds.has(a.id)).reduce((sum, a) => sum + a.price, 0),
    [addons, selectedAddonIds],
  );
  const summaryTotal = (currentPrice ?? basePrice) * qty + addonsTotal;

  function toggleAddon(id: number) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd(openCheckoutAfter: boolean) {
    if (currentPrice == null || locked) return;
    const addonItems = addons
      .filter((a) => selectedAddonIds.has(a.id))
      .map((a) => ({
        productId: a.id,
        name: a.name,
        categorySlug: a.categorySlug,
        size: "5" as Size,
        unitPrice: a.price,
        qty: 1,
        isCombo: false,
      }));
    addItems([
      { productId, name, categorySlug, size, unitPrice: currentPrice, qty, isCombo: false },
      ...addonItems,
    ]);
    toast.success("Producto agregado al carrito", { duration: 1500 });
    setLocked(true);
    setTimeout(() => setLocked(false), 1500);
    // addItems ya NO abre el carrito (ver CartContext.tsx) — el toast es la
    // única confirmación. Acá solo hace falta abrir el checkout.
    if (openCheckoutAfter) openCheckout();
  }

  return (
    <div>
      <div className="text-muted mb-2.5 text-[32px] font-extrabold">
        S/. {formatPEN(currentPrice ?? basePrice)}
      </div>

      <div className="text-muted mb-2.5 text-xs font-bold tracking-wide">TAMAÑO</div>
      {/* Mobile: flex-1 (todas las opciones comparten el ancho disponible y
          entran siempre en una sola fila, sin wrap) — desktop: ancho fijo
          130-145px como pide el diseño premium. */}
      <div role="radiogroup" aria-label="Tamaño" className="mb-7 flex gap-2 pt-2.5 md:gap-5">
        {availableSizes.map((sz) => {
          const isSelected = size === sz;
          return (
            <label
              key={sz}
              className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 border-2 px-2 py-4 text-center transition-all duration-150 ease-out md:flex-none md:w-[135px] md:px-5 md:py-6 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground ${
                isSelected
                  ? "border-foreground bg-white shadow-[0_2px_10px_rgba(0,0,0,0.10)]"
                  : "border-border-strong bg-white hover:border-foreground/40"
              }`}
            >
              <input
                type="radio"
                name={`product-size-${productId}`}
                value={sz}
                checked={isSelected}
                onChange={() => onSizeChange(sz)}
                className="sr-only"
              />

              {/* 5ml es el tamaño base (siempre disponible, todo producto lo
                  tiene) — se destaca para llamar la atención hacia esa
                  opción, no depende del flag best_seller del producto (eso
                  controla qué PRODUCTOS aparecen en el carrusel de home, acá
                  es sobre el TAMAÑO). Mismo verde/estilo que el badge
                  "★ MÁS VENDIDO" del hero, para que se lea como la misma
                  seña visual en todo el sitio. */}
              {sz === "5" && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#00c164] px-2 py-0.5 text-[9px] font-bold whitespace-nowrap text-foreground">
                  MÁS VENDIDO
                </span>
              )}

              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                  isSelected ? "border-foreground" : "border-border-strong"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full bg-foreground transition-transform duration-150 ${
                    isSelected ? "scale-100" : "scale-0"
                  }`}
                />
              </span>

              <div className="text-[15px] font-extrabold">S/. {formatPEN(getSizePrice(pricing, sz) ?? 0)}</div>
              <div className="text-muted-2 text-[11px]">
                {sz === "full" ? sizeLabel(sz) : `${sz}ml / ${SPRAYS_BY_SIZE[sz]} sprays`}
              </div>
            </label>
          );
        })}
      </div>

      {onSale && addons.length > 0 && (
        <ProductAddonPicker addons={addons} selectedIds={selectedAddonIds} onToggle={toggleAddon} />
      )}

      {/* Total estimado — recalcula solo si se tildan opcionales de
          "Combínalo y ahorra" (addonsTotal) o cambia la cantidad. */}
      <div className="mb-6 flex items-center justify-between border-t border-b border-border-strong py-4">
        <span className="text-muted text-xs font-bold tracking-wide">TOTAL</span>
        <span className="text-xl font-extrabold">S/. {formatPEN(summaryTotal)}</span>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="flex items-center gap-2.5 border border-border-strong px-1">
          <button
            type="button"
            aria-label="Reducir cantidad"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 bg-transparent text-base"
          >
            −
          </button>
          <span className="w-5 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQty((q) => Math.min(MAX_QTY_PER_LINE, q + 1))}
            className="w-8 bg-transparent text-base"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={locked}
          onClick={() => handleAdd(false)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-4.5 text-xs font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-muted-2"
        >
          AGREGAR AL CARRITO
          <svg fill="currentColor" viewBox="0 0 16 16" className="size-4" aria-hidden="true">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        disabled={locked}
        onClick={() => handleAdd(true)}
        className="mb-9 w-full bg-[#00c164] py-4.5 text-sm font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        OBTENER AHORA
      </button>

      <div className="border-t border-border">
        <Collapsible defaultOpen className="border-b border-border py-5">
          <CollapsibleTrigger>
            <span className="text-sm font-bold tracking-wide">Producto</span>
          </CollapsibleTrigger>
          <CollapsiblePanel className="text-muted pt-4 text-sm leading-relaxed whitespace-pre-line">
            {description || NO_DESCRIPTION_FALLBACK}
          </CollapsiblePanel>
        </Collapsible>

        <Collapsible defaultOpen={false} className="py-5">
          <CollapsibleTrigger>
            <span className="text-sm font-bold tracking-wide">Envíos y Devoluciones</span>
          </CollapsibleTrigger>
          <CollapsiblePanel className="text-muted pt-4 text-sm leading-relaxed whitespace-pre-line">
            {SHIPPING_RETURNS_TEXT}
          </CollapsiblePanel>
        </Collapsible>
      </div>
    </div>
  );
}
