import { SIZES, type ComboSize } from "./pricing";

export type ComboCategorySlug = "arabes" | "disenador" | "exclusivos" | "nicho";

export const COMBO_CATEGORY_SLUGS: readonly ComboCategorySlug[] = [
  "arabes",
  "disenador",
  "exclusivos",
  "nicho",
];

export function isComboCategorySlug(slug: string): slug is ComboCategorySlug {
  return (COMBO_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

function isComboSize(size: string): size is ComboSize {
  return (SIZES as readonly string[]).includes(size);
}

/** Etiqueta legible por slug, para el desglose por par en el resumen del
 * combo — no depende de recibir la lista viva de categorías (CartDrawer y
 * CheckoutModal no la tienen a mano hoy). */
export const COMBO_CATEGORY_LABELS: Record<ComboCategorySlug, string> = {
  arabes: "Árabes",
  disenador: "Diseñador",
  exclusivos: "Exclusivos",
  nicho: "Nicho",
};

/** Tope máximo de unidades por cada par (categoría, tamaño) en un mismo
 * pedido — mantener sincronizado con el chequeo de `v_combo_pair_over_cap`
 * en `place_order()` (supabase/schema.sql /
 * supabase/migrations/0014_combo_pair_discount_and_cap.sql). */
export const MAX_QTY_PER_PAIR = 6;

type PairDiscountByQty = Record<2 | 3 | 4 | 5 | 6, number>;

/**
 * Única fuente de verdad del descuento de "Arma tu Combo": montos fijos en
 * soles por (categoría, tamaño, cantidad de ese par exacto). Reemplaza el
 * sistema anterior (BUNDLE_DISCOUNT_TIERS, un solo monto según la cantidad
 * TOTAL del combo sin distinguir categoría ni tamaño).
 *
 * Cada categoría se calculó escalando la tabla de "arabes" (base) por un
 * factor fijo, confirmado con el dueño de la tienda: disenador ×1.5
 * (redondeado hacia abajo en los dos casos no exactos), exclusivos ×5,
 * nicho ×2. Los montos de exclusivos son deliberadamente agresivos en los
 * tramos altos (hasta ~67-83% de descuento sobre el subtotal) — confirmado
 * y no hay que ajustarlos.
 *
 * Para cambiar estos montos, editar este objeto — pero recordar mantener
 * sincronizada la misma tabla en la función `combo_pair_discount()` de
 * supabase/schema.sql y supabase/migrations/0014_combo_pair_discount_and_cap.sql
 * (el cálculo autoritativo vive ahí, en Postgres).
 */
export const COMBO_PAIR_DISCOUNT_TABLE: Record<ComboCategorySlug, Record<ComboSize, PairDiscountByQty>> = {
  arabes: {
    "3": { 2: 5, 3: 10, 4: 20, 5: 25, 6: 30 },
    "5": { 2: 10, 3: 20, 4: 40, 5: 50, 6: 60 },
    "10": { 2: 10, 3: 30, 4: 40, 5: 50, 6: 60 },
  },
  disenador: {
    "3": { 2: 7, 3: 15, 4: 30, 5: 37, 6: 45 },
    "5": { 2: 15, 3: 30, 4: 60, 5: 75, 6: 90 },
    "10": { 2: 15, 3: 45, 4: 60, 5: 75, 6: 90 },
  },
  exclusivos: {
    "3": { 2: 25, 3: 50, 4: 100, 5: 125, 6: 150 },
    "5": { 2: 50, 3: 100, 4: 200, 5: 250, 6: 300 },
    "10": { 2: 50, 3: 150, 4: 200, 5: 250, 6: 300 },
  },
  nicho: {
    "3": { 2: 10, 3: 20, 4: 40, 5: 50, 6: 60 },
    "5": { 2: 20, 3: 40, 4: 80, 5: 100, 6: 120 },
    "10": { 2: 20, 3: 60, 4: 80, 5: 100, 6: 120 },
  },
};

/** Descuento (en soles) para `qty` unidades de un mismo par (categoría,
 * tamaño). 0 si qty<2, si la categoría no es elegible para combo, o si el
 * tamaño es inválido. `qty` se recorta a MAX_QTY_PER_PAIR por seguridad —
 * no debería llegar más alto, el tope se aplica antes, en la UI y en
 * `place_order`. */
export function getPairDiscount(categorySlug: string, size: ComboSize, qty: number): number {
  if (qty < 2 || !isComboCategorySlug(categorySlug)) return 0;
  const clamped = Math.min(qty, MAX_QTY_PER_PAIR) as 2 | 3 | 4 | 5 | 6;
  return COMBO_PAIR_DISCOUNT_TABLE[categorySlug][size][clamped] ?? 0;
}

export type ComboPairGroup = { categorySlug: string; size: ComboSize; qty: number };

type ComboLikeItem = { categorySlug: string; size: string; qty: number; isCombo: boolean };

/** Agrupa items marcados is_combo=true por (categorySlug, size) y suma la
 * cantidad de cada grupo — sirve tanto para items ya en el carrito
 * (CartContext) como para los grupos armados en ComboBuilder antes de
 * confirmar. */
export function groupComboPairs(items: ComboLikeItem[]): ComboPairGroup[] {
  const map = new Map<string, ComboPairGroup>();
  for (const item of items) {
    if (!item.isCombo || !isComboSize(item.size)) continue;
    const key = `${item.categorySlug}::${item.size}`;
    const existing = map.get(key);
    if (existing) existing.qty += item.qty;
    else map.set(key, { categorySlug: item.categorySlug, size: item.size, qty: item.qty });
  }
  return [...map.values()];
}

/** Suma el descuento de cada par (categoría, tamaño) presente — sin
 * término cruzado entre pares: cada uno se calcula de forma independiente
 * y luego se suman. */
export function getComboDiscountForItems(items: ComboLikeItem[]): number {
  return groupComboPairs(items).reduce((total, g) => total + getPairDiscount(g.categorySlug, g.size, g.qty), 0);
}

/** Próximo escalón de cantidad no alcanzado todavía para este par
 * específico, o `null` si ya llegó al tope (MAX_QTY_PER_PAIR). */
export function getNextPairTier(
  categorySlug: string,
  size: ComboSize,
  qty: number,
): { qty: number; discount: number } | null {
  if (!isComboCategorySlug(categorySlug)) return null;
  for (let n = 2; n <= MAX_QTY_PER_PAIR; n++) {
    if (n > qty) return { qty: n, discount: COMBO_PAIR_DISCOUNT_TABLE[categorySlug][size][n as 2 | 3 | 4 | 5 | 6] };
  }
  return null;
}

export function isPairAtCap(qty: number): boolean {
  return qty >= MAX_QTY_PER_PAIR;
}

/** Ahorro adicional (en soles) que se gana al llegar al próximo escalón de
 * este par (0 si ya está en el tope). */
export function getAdditionalPairSavings(categorySlug: string, size: ComboSize, qty: number): number {
  const next = getNextPairTier(categorySlug, size, qty);
  if (!next) return 0;
  return next.discount - getPairDiscount(categorySlug, size, qty);
}
