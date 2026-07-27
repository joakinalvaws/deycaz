import type { CartItem } from "./types";
import type { ShippingMethod } from "./shipping";
import { SPRAYS_BY_SIZE, formatPEN } from "./pricing";

function describeItemSize(item: CartItem): string {
  if (item.size === "full") return "Frasco completo";
  return `${item.size}ml / ${SPRAYS_BY_SIZE[item.size]} sprays`;
}

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
      `🔢 Cantidad: ${i.qty} ${i.name} - ${describeItemSize(i)}`,
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
  lines.push("", "✅ Confirmo que mis datos y dirección son correctos");
  // Solo en Lima el pedido se "recibe contra entrega" en la puerta — por
  // Shalom el cliente lo recoge en agencia y paga el flete ahí, así que
  // confirmar "recibiré y pagaré contra entrega" sería falso en ese caso.
  if (params.shippingMethod === "lima_delivery") {
    lines.push("✅ Confirmo que recibiré y pagaré el pedido contra entrega");
  } else {
    lines.push("✅ Confirmo que recogeré mi pedido en la agencia Shalom y pagaré el flete correspondiente");
  }
  return lines.join("\n");
}

/**
 * Arma la URL final de WhatsApp. Se probó `wa.me` en dispositivos reales y no
 * funcionó bien — `api.whatsapp.com/send/` es el formato confirmado que sí
 * funciona, así que es el que se usa acá. Un solo `encodeURIComponent` sobre
 * el mensaje completo (sin escapar espacios/saltos de línea a mano, sin doble
 * encoding, nunca `decodeURIComponent`).
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}
