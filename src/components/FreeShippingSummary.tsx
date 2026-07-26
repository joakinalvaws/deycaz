import { getFreeShippingProgress, getRemainingForFreeShipping } from "@/lib/shipping";
import type { ShippingMethod } from "@/lib/shipping";
import { formatPEN } from "@/lib/pricing";
import { ProgressBar } from "./ProgressBar";

export function FreeShippingSummary({
  discountedSubtotal,
  shippingMethod,
}: {
  discountedSubtotal: number;
  shippingMethod: ShippingMethod | null;
}) {
  // Shalom nunca cobra envío en la tienda (se paga en la agencia al
  // recoger) — mostrar aquí un umbral de envío gratis sería confuso.
  if (shippingMethod === "shalom_provincia") return null;

  const remaining = getRemainingForFreeShipping(discountedSubtotal);
  const progress = getFreeShippingProgress(discountedSubtotal);

  return (
    <div className="flex flex-col gap-1.5">
      {remaining > 0 ? (
        <p className="text-[13px] font-semibold">
          🚚 Te faltan S/. {formatPEN(remaining)} para envío gratis
        </p>
      ) : (
        <p className="text-[13px] font-semibold text-success">🚚 ¡Tienes envío gratis!</p>
      )}
      <ProgressBar value={progress} />
    </div>
  );
}
