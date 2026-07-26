import type { Size } from "./pricing";

export type Category = {
  slug: string;
  name: string;
  subtitle: string | null;
  desde: number | null;
};

export type Product = {
  id: number;
  name: string;
  categorySlug: string;
  price: number;
  price3ml: number | null;
  price10ml: number | null;
  priceFullBottle: number | null;
  originalPrice: number | null;
  badge: string | null;
  bestSeller: boolean;
  onSale: boolean;
  imageUrl: string | null;
  description: string | null;
};

export type Testimonial = {
  id: number;
  name: string;
  stars: number;
  text: string;
  imageUrl: string | null;
};

/** Foto de un producto — `sizeTag` no-null significa que es la foto a
 * mostrar cuando el cliente elige ese tamaño en la página del producto;
 * `isPrimary` es la del card (ya reflejada en `Product.imageUrl`); si
 * ninguna de las dos, es una foto suelta de la galería general. */
export type ProductImage = {
  url: string;
  sizeTag: Size | null;
  isPrimary: boolean;
};

/** Item del carrito. El precio unitario es siempre el precio "de lista" del
 * tamaño (para items de combo, el precio plano de `FLAT_COMBO_SIZE_PRICE`,
 * sin descuento incrustado) — el descuento por nivel de combo se calcula y
 * resta una sola vez a nivel de subtotal (ver `CartContext` y
 * `bundleDiscount.ts`), nunca por unidad. El servidor vuelve a calcular el
 * precio y el descuento autoritativos al finalizar la compra. */
export type CartItem = {
  productId: number;
  name: string;
  categorySlug: string;
  size: Size;
  unitPrice: number;
  qty: number;
  isCombo: boolean;
};
