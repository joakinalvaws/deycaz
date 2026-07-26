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
};

/** Item del carrito. El precio unitario queda fijado al momento de agregarlo
 * (incluye el descuento ya aplicado si viene de Arma tu Combo); el servidor
 * vuelve a calcular el precio autoritativo al finalizar la compra. */
export type CartItem = {
  productId: number;
  name: string;
  categorySlug: string;
  size: Size;
  unitPrice: number;
  qty: number;
  isCombo: boolean;
};
