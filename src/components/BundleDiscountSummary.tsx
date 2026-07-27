import { COMBO_CATEGORY_LABELS, getPairDiscount, isComboCategorySlug, type ComboPairGroup } from "@/lib/bundleDiscount";
import { formatPEN } from "@/lib/pricing";

/** Resumen del ahorro total de "Arma tu Combo", agregando sobre un número
 * no acotado de pares (categoría, tamaño) simultáneos — a diferencia del
 * sistema anterior (un solo nivel por cantidad total), acá no hay un único
 * "próximo nivel" hacia el cual mostrar una barra de progreso (¿hacia cuál
 * par sería?), así que esta versión solo muestra el total ahorrado y, si
 * hay más de un par, su desglose. La barra de progreso hacia el próximo
 * escalón de UN par específico vive en ComboPairTierHint. */
export function BundleDiscountSummary({
  pairs,
  maxTierMessage = "🏆 ¡Obtuviste el máximo descuento del combo!",
}: {
  pairs: ComboPairGroup[];
  maxTierMessage?: string;
}) {
  if (pairs.length === 0) return null;

  const rows = pairs
    .filter((p) => isComboCategorySlug(p.categorySlug))
    .map((p) => ({ ...p, discount: getPairDiscount(p.categorySlug, p.size, p.qty) }));
  const totalDiscount = rows.reduce((a, r) => a + r.discount, 0);
  const allAtCap = rows.every((r) => r.qty >= 6);

  return (
    <div className="flex flex-col gap-1.5">
      {totalDiscount > 0 ? (
        <div className="flex items-center justify-between text-[13px] font-bold text-success">
          <span>🎉 Ahorras S/. {formatPEN(totalDiscount)} con el combo</span>
        </div>
      ) : (
        <p className="text-muted-2 text-[13px]">Agrega 1 perfume más para comenzar a ahorrar.</p>
      )}

      {rows.length > 1 && (
        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div key={`${r.categorySlug}::${r.size}`} className="text-muted-2 flex justify-between text-[12px]">
              <span>
                {isComboCategorySlug(r.categorySlug) ? COMBO_CATEGORY_LABELS[r.categorySlug] : r.categorySlug} ·{" "}
                {r.size}ML ×{r.qty}
              </span>
              <span>-S/. {formatPEN(r.discount)}</span>
            </div>
          ))}
        </div>
      )}

      {allAtCap && totalDiscount > 0 && <p className="text-[13px] font-semibold">{maxTierMessage}</p>}
    </div>
  );
}
