import { getAdditionalPairSavings, getNextPairTier, isPairAtCap } from "@/lib/bundleDiscount";
import type { ComboSize } from "@/lib/pricing";
import { formatPEN } from "@/lib/pricing";
import { ProgressBar } from "./ProgressBar";

/** Barra de progreso "hacia el próximo escalón de descuento", escopeada a
 * UN solo par (categoría, tamaño) — que es justo lo que hay mientras se
 * arma un grupo en ComboBuilder (una categoría + un tamaño a la vez). No
 * generaliza a varios pares simultáneos a propósito; ese caso lo cubre
 * BundleDiscountSummary sin barra. */
export function ComboPairTierHint({
  categorySlug,
  size,
  qty,
}: {
  categorySlug: string;
  size: ComboSize;
  qty: number;
}) {
  if (qty < 1) return null;

  const next = getNextPairTier(categorySlug, size, qty);
  const additional = getAdditionalPairSavings(categorySlug, size, qty);
  const progress = next ? Math.min(qty / next.qty, 1) : 1;
  const atCap = isPairAtCap(qty);

  return (
    <div className="flex flex-col gap-1.5">
      <ProgressBar value={progress} />
      {atCap ? (
        <p className="text-[13px] font-semibold">🏆 Llegaste al máximo de este grupo (6 unidades)</p>
      ) : next ? (
        <p className="text-muted-2 text-[13px]">
          Agrega 1 más y ahorra S/. {formatPEN(additional)} adicionales en este grupo.
        </p>
      ) : null}
    </div>
  );
}
