import type { CartItem } from "./types";
import type { ShippingMethod } from "./shipping";
import { SPRAYS_BY_SIZE, formatPEN } from "./pricing";

export type WhatsAppOrderMessageParams = {
  orderNumber: number;
  nombre: string;
  dni: string;
  celular: string;
  items: CartItem[];
  total: number;
  shippingMethod: ShippingMethod;
  direccion: string;
  distrito: string;
  provincia: string;
  shalomAgency: string;
};

/**
 * Arma el mensaje de confirmación de pedido como texto UTF-8 normal (template
 * literals, sin codificar nada acá) — la codificación final para la URL de
 * WhatsApp se hace una sola vez en `buildWhatsAppUrl`, nunca acá.
 */
export function buildOrderWhatsAppMessage(params: WhatsAppOrderMessageParams): string {
  const lines = [
    "Hola 👋 quiero confirmar mi pedido en DEYCAZ",
    "",
    `🧾 Pedido: ${params.orderNumber}`,
    `👤 Nombre: ${params.nombre}`,
    `🪪 DNI: ${params.dni || "-"}`,
    `📱 WhatsApp: ${params.celular}`,
    "",
    ...params.items.flatMap((i) => [
      `📦 Producto: ${i.name}`,
      `🔢 Cantidad: ${i.qty} ${i.name} - ${i.size}ml / ${SPRAYS_BY_SIZE[i.size] ?? ""} sprays`,
    ]),
    "",
    `💰 Total a pagar: S/. ${formatPEN(params.total)}`,
    `🚚 Método de envío: ${params.shippingMethod === "lima_delivery" ? "DELIVERY (LIMA)" : "SHALOM (PROVINCIA)"}`,
    "",
    "📍 Dirección de entrega:",
    `${params.direccion}`,
    `${params.distrito}, ${params.provincia}, Perú`,
  ];
  if (params.shippingMethod === "shalom_provincia") {
    lines.push(`🏢 Agencia Shalom: ${params.shalomAgency}`);
  }
  lines.push(
    "",
    "✅ Confirmo que mis datos y dirección son correctos",
    "✅ Confirmo que recibiré y pagaré el pedido contra entrega",
  );
  return lines.join("\n");
}

/**
 * Arma la URL final de wa.me. Un solo `encodeURIComponent` sobre el mensaje
 * completo (sin escapar espacios/saltos de línea a mano, sin doble encoding,
 * nunca `decodeURIComponent`) — el resultado es equivalente a
 * `https://wa.me/{phone}?text=${encodeURIComponent(message)}`.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
