import type { Size } from "./pricing";

export type Category = {
  slug: string;
  name: string;
  subtitle: string | null;
  desde: number | null;
  /** Foto de fondo del tile de categoría. Si es null el tile queda con el
   * fondo oscuro liso (ver `CategoryTile`). */
  imageUrl: string | null;
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
  /** Hasta 2 productos recomendados para "Combínalo y ahorra" en el PDP —
   * solo se usan cuando `onSale` es true. Null si no hay configurado. */
  addonProductId1: number | null;
  addonProductId2: number | null;
};

/** Producto recomendado resuelto (solo lo que necesita "Combínalo y
 * ahorra": imagen, nombre, precio de 5ml) — ver `getProductAddons`. */
export type ProductAddon = {
  id: number;
  name: string;
  categorySlug: string;
  price: number;
  imageUrl: string | null;
};

/** Lo mínimo que necesita el buscador del header: nombre para filtrar,
 * precio para mostrar, id para navegar. Este arreglo viaja en el RSC de
 * TODAS las páginas del sitio (el header vive en el layout), así que mandar
 * el `Product` completo era pagar ~12 campos por producto en cada página
 * para usar 3. */
export type ProductSearchEntry = Pick<Product, "id" | "name" | "price">;

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
  /** true si esta línea se agregó desde "Combínalo y ahorra" en el PDP de
   * una promoción — el servidor le resta ADDON_DISCOUNT por unidad al
   * calcular el precio autoritativo (ver pricing.ts). */
  isAddon: boolean;
};
