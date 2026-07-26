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
 * Precio de un tamaño para un producto individual. 3ml/10ml usan el precio
 * propio del producto si está cargado; si no, caen a la fórmula vieja
 * (70%/170% del precio base) como valor por defecto. "full" (frasco
 * entero) devuelve `null` si el producto no tiene ese precio configurado —
 * quien llama debe ocultar esa opción en ese caso. El precio final y
 * autoritativo se recalcula siempre en el servidor dentro de `place_order`
 * (supabase/schema.sql), nunca se confía en este cálculo del cliente.
 */
export function getSizePrice(product: ProductSizePricing, size: Size): number | null {
  if (size === "5") return product.price;
  if (size === "3") return product.price3ml ?? Math.round(product.price * 0.7);
  if (size === "10") return product.price10ml ?? Math.round(product.price * 1.7);
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
