"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { PRODUCT_PAGE_SIZES, getSizePrice, formatPEN, type Size } from "@/lib/pricing";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";

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

const SIZE_LABEL: Record<Size, string> = {
  "3": "3ML",
  "5": "5ML",
  "10": "10ML",
  full: "FRASCO",
};

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

  const [qty, setQty] = useState(1);
  // Un solo lock para los dos botones: ambos disparan el mismo addItem, y
  // un timer compartido evita una carrera si se clickea uno y después el
  // otro dentro de la ventana de 2s.
  const [locked, setLocked] = useState(false);
  const { addItem, closeCart, openCheckout } = useCart();

  const currentPrice = getSizePrice(pricing, size);

  function handleAdd(openCheckoutAfter: boolean) {
    if (currentPrice == null || locked) return;
    addItem({ productId, name, categorySlug, size, unitPrice: currentPrice, qty });
    toast.success("Producto agregado al carrito");
    setLocked(true);
    setTimeout(() => setLocked(false), 2000);
    if (openCheckoutAfter) {
      // addItem ya abrió el CartDrawer (mismo efecto secundario que "Agregar
      // al carrito" solo) — hay que cerrarlo antes de abrir el checkout, si
      // no quedan los dos overlays abiertos a la vez. Mismo patrón que ya
      // usa el botón "CONFIRMAR COMPRA" de CartDrawer.tsx.
      closeCart();
      openCheckout();
    }
  }

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
          className="flex-1 bg-foreground py-4.5 text-sm font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-muted-2"
        >
          AGREGAR AL CARRITO
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
