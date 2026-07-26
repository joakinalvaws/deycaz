/**
 * Única fuente de verdad del descuento por niveles de "Arma tu Combo".
 * Reemplaza el sistema anterior de descuento por porcentaje (`comboDiscountRate`
 * en pricing.ts) por montos fijos en soles según cantidad total de decants de
 * combo en el pedido. El nivel alcanzado nunca se acumula con los anteriores —
 * siempre se aplica únicamente el descuento del nivel más alto alcanzado.
 *
 * Para cambiar los niveles en el futuro, solo hay que editar este arreglo —
 * pero recordar mantener sincronizada la misma tabla en
 * supabase/schema.sql y supabase/migrations/0005_bundle_discount_tiers.sql
 * (el cálculo autoritativo vive en la función `place_order` de Postgres).
 */
export type BundleTier = { minQty: number; discount: number };

export const BUNDLE_DISCOUNT_TIERS: readonly BundleTier[] = [
  { minQty: 1, discount: 0 },
  { minQty: 2, discount: 10 },
  { minQty: 3, discount: 20 },
  { minQty: 4, discount: 35 },
  { minQty: 5, discount: 45 },
  { minQty: 6, discount: 50 },
];

function currentTier(quantity: number): BundleTier {
  let tier = BUNDLE_DISCOUNT_TIERS[0];
  for (const t of BUNDLE_DISCOUNT_TIERS) {
    if (quantity >= t.minQty) tier = t;
  }
  return tier;
}

/** Monto fijo (en soles) del nivel alcanzado con esta cantidad de decants de combo. */
export function getBundleDiscount(quantity: number): number {
  if (quantity < 1) return 0;
  return currentTier(quantity).discount;
}

/** Próximo nivel no alcanzado todavía, o `null` si ya está en el tope. */
export function getNextBundleTier(quantity: number): BundleTier | null {
  const next = BUNDLE_DISCOUNT_TIERS.find((t) => t.minQty > quantity);
  return next ?? null;
}

export function isMaxBundleTier(quantity: number): boolean {
  return getNextBundleTier(quantity) === null;
}

/** Cuántos decants faltan para desbloquear el próximo nivel (0 si ya está en el tope). */
export function getRemainingProducts(quantity: number): number {
  const next = getNextBundleTier(quantity);
  return next ? next.minQty - quantity : 0;
}

/** Ahorro adicional (en soles) que se gana al llegar al próximo nivel (0 en el tope). */
export function getAdditionalSavings(quantity: number): number {
  const next = getNextBundleTier(quantity);
  if (!next) return 0;
  return next.discount - getBundleDiscount(quantity);
}

/**
 * Progreso hacia el próximo nivel, de 0 a 1. Se calcula como
 * `quantity / next.minQty` (y no "por segmento" entre el nivel actual y el
 * siguiente) porque casi todos los saltos de nivel son de a 1 en 1 — un
 * progreso por segmento volvería a 0% en cada cruce de nivel, sin nunca
 * mostrar un estado intermedio real.
 */
export function getBundleProgress(quantity: number): number {
  const next = getNextBundleTier(quantity);
  if (!next) return 1;
  return Math.min(quantity / next.minQty, 1);
}
