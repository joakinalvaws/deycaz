export type Size = "3" | "5" | "10";

export const SIZES: Size[] = ["3", "5", "10"];

/** Precio plano por tamaño usado solo dentro de "Arma tu Combo", igual para
 * cualquier producto (independiente de su precio base individual). */
export const FLAT_COMBO_SIZE_PRICE: Record<Size, number> = {
  "3": 30,
  "5": 45,
  "10": 75,
};

/**
 * Precio de un producto individual según su tamaño, a partir del precio base
 * (que corresponde al tamaño 5ml). Estas fórmulas son solo para mostrar el
 * precio en el cliente — el precio final y autoritativo se recalcula en el
 * servidor dentro de la función `place_order` (supabase/schema.sql) a partir
 * del precio actual en la base de datos, para que nadie pueda manipular el
 * precio desde el navegador.
 */
export function priceForSize(basePrice: number, size: Size): number {
  if (size === "3") return Math.round(basePrice * 0.7);
  if (size === "10") return Math.round(basePrice * 1.7);
  return basePrice;
}

/** Sprays estimados por tamaño de decant, usado en el mensaje de WhatsApp. */
export const SPRAYS_BY_SIZE: Record<Size, number> = { "3": 50, "5": 85, "10": 170 };

export function formatPEN(amount: number): string {
  return amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
