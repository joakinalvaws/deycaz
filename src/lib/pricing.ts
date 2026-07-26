export type Size = "3" | "5" | "10" | "full";

/** Tamaños que participan de "Arma tu Combo" — el frasco entero nunca
 * entra ahí, se compra siempre individual. */
export type ComboSize = Exclude<Size, "full">;

export const SIZES: ComboSize[] = ["3", "5", "10"];

/** Tamaños que se ofrecen en la página de un producto individual. */
export const PRODUCT_PAGE_SIZES: Size[] = ["3", "5", "10", "full"];

/** Precio plano por tamaño usado solo dentro de "Arma tu Combo", igual para
 * cualquier producto (independiente de su precio base individual). */
export const FLAT_COMBO_SIZE_PRICE: Record<ComboSize, number> = {
  "3": 30,
  "5": 45,
  "10": 75,
};

export type ProductSizePricing = {
  price: number; // 5ml — precio base
  price3ml?: number | null;
  price10ml?: number | null;
  priceFullBottle?: number | null;
};

/**
 * Precio de un tamaño para un producto individual. Cada tamaño (3ml, 10ml,
 * frasco entero) necesita su propio precio cargado en el producto — sin
 * fórmula ni valor por defecto — devuelve `null` si no está configurado, y
 * quien llama debe ocultar esa opción en ese caso (ver `PRODUCT_PAGE_SIZES`
 * filtrado en `ProductDetail`). El precio final y autoritativo se recalcula
 * siempre en el servidor dentro de `place_order` (supabase/schema.sql),
 * nunca se confía en este cálculo del cliente.
 */
export function getSizePrice(product: ProductSizePricing, size: Size): number | null {
  if (size === "5") return product.price;
  if (size === "3") return product.price3ml ?? null;
  if (size === "10") return product.price10ml ?? null;
  return product.priceFullBottle ?? null;
}

/** Sprays estimados por tamaño de decant, usado en el mensaje de WhatsApp
 * — no aplica a "full" (el frasco entero no se mide en sprays estimados,
 * varía según el tamaño real de cada frasco). */
export const SPRAYS_BY_SIZE: Record<ComboSize, number> = { "3": 50, "5": 85, "10": 170 };

/** Etiqueta para mostrar un tamaño (carrito, checkout, etc.). */
export function sizeLabel(size: Size): string {
  return size === "full" ? "Frasco entero" : `${size}ML`;
}

export function formatPEN(amount: number): string {
  return amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
