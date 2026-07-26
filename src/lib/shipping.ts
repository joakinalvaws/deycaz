export type ShippingMethod = "lima_delivery" | "shalom_provincia";

export const FREE_SHIPPING_THRESHOLD = 250;
export const LIMA_DELIVERY_FLAT_FEE = 15;

/** Estimado para mostrar en el modal — el cálculo autoritativo (el que de
 * verdad se cobra) vive en la función `place_order` (supabase/schema.sql),
 * que nunca confía en un monto de envío calculado en el navegador. */
export function estimateShippingCost(method: ShippingMethod, subtotal: number): number {
  if (method === "lima_delivery") {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : LIMA_DELIVERY_FLAT_FEE;
  }
  return 0; // Shalom: el cliente paga el flete directamente en la agencia.
}

/** Progreso hacia el envío gratis (Lima Delivery), de 0 a 1. */
export function getFreeShippingProgress(subtotal: number): number {
  return Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
}

/** Cuánto falta (en soles) para el envío gratis (Lima Delivery). 0 si ya lo alcanzó. */
export function getRemainingForFreeShipping(subtotal: number): number {
  return Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
}
