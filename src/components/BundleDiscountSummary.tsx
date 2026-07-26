import {
  getAdditionalSavings,
  getBundleDiscount,
  getBundleProgress,
  isMaxBundleTier,
} from "@/lib/bundleDiscount";
import { formatPEN } from "@/lib/pricing";
import { ProgressBar } from "./ProgressBar";

export function BundleDiscountSummary({
  comboQty,
  maxTierMessage = "🏆 ¡Obtuviste el máximo descuento del combo!",
}: {
  comboQty: number;
  maxTierMessage?: string;
}) {
  if (comboQty < 1) return null;

  const discount = getBundleDiscount(comboQty);
  const atMax = isMaxBundleTier(comboQty);
  const additionalSavings = getAdditionalSavings(comboQty);
  const progress = getBundleProgress(comboQty);

  return (
    <div className="flex flex-col gap-1.5">
      {discount > 0 ? (
        <div className="flex items-center justify-between text-[13px] font-bold text-success">
          <span>🎉 Ahorras S/. {formatPEN(discount)} con el combo</span>
        </div>
      ) : (
        <p className="text-muted-2 text-[13px]">Agrega 1 perfume más para comenzar a ahorrar.</p>
      )}

      <ProgressBar value={progress} />

      {atMax ? (
        <p className="text-[13px] font-semibold">{maxTierMessage}</p>
      ) : (
        <p className="text-muted-2 text-[13px]">
          Agrega 1 perfume más y ahorra S/. {formatPEN(additionalSavings)} adicionales.
        </p>
      )}
    </div>
  );
}
