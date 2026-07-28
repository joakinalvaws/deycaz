"use server";

import { supabase } from "@/lib/supabase";
import type { Size } from "@/lib/pricing";
import type { ShippingMethod } from "@/lib/shipping";
import { sendContactNotificationEmail } from "@/lib/email";

export type PlaceOrderInput = {
  customerName: string;
  customerPhone: string;
  shippingMethod: ShippingMethod;
  dni?: string;
  provincia: string;
  distrito: string;
  customerAddress: string;
  shalomAgency?: string;
  items: { productId: number; size: Size; qty: number; isCombo: boolean }[];
};

export type PlaceOrderResult = { ok: true; orderNumber: number } | { ok: false; error: string };

/**
 * Topes de sanidad del pedido. La UI nunca los alcanza (el carrito se arma
 * de a un decant por click), pero un Server Action es un POST público —
 * cualquiera puede mandarle `qty: 999999` o 5000 líneas sin pasar por la
 * página. Sin esto entraban pedidos basura que hay que limpiar a mano.
 * Los mismos límites están replicados en `place_order`
 * (supabase/migrations/0012_order_sanity_limits.sql), que es la validación
 * autoritativa: acá solo se cortan antes para devolver un mensaje claro.
 */
const MAX_QTY_PER_LINE = 50;
const MAX_LINES_PER_ORDER = 40;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  const provincia = input.provincia.trim();
  const distrito = input.distrito.trim();
  const customerAddress = input.customerAddress.trim();
  const dni = input.dni?.trim() || "";
  const shalomAgency = input.shalomAgency?.trim() || "";
  const isShalom = input.shippingMethod === "shalom_provincia";

  if (!customerName || !customerPhone || !provincia || !distrito || !customerAddress) {
    return { ok: false, error: "Completa nombre, celular, ubicación y dirección de entrega." };
  }
  if (isShalom && !/^\d{8}$/.test(dni)) {
    return { ok: false, error: "Ingresa un DNI válido de 8 dígitos para envíos por Shalom." };
  }
  if (isShalom && !shalomAgency) {
    return { ok: false, error: "Indica la agencia Shalom donde recogerás tu pedido." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }
  if (input.items.length > MAX_LINES_PER_ORDER) {
    return { ok: false, error: "Tu pedido tiene demasiados productos distintos. Escríbenos por WhatsApp para pedidos grandes." };
  }
  const itemsAreValid = input.items.every(
    (i) =>
      Number.isInteger(i.productId) &&
      i.productId > 0 &&
      Number.isInteger(i.qty) &&
      i.qty > 0 &&
      i.qty <= MAX_QTY_PER_LINE,
  );
  if (!itemsAreValid) {
    return { ok: false, error: `Revisa las cantidades: máximo ${MAX_QTY_PER_LINE} unidades por producto.` };
  }

  // El precio de cada línea y el costo de envío se recalculan por completo
  // dentro de la función place_order en Postgres — nunca se confía en montos
  // enviados desde el navegador.
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_dni: isShalom ? dni : null,
    p_provincia: provincia,
    p_distrito: distrito,
    p_customer_address: customerAddress,
    p_shalom_agency: isShalom ? shalomAgency : null,
    p_shipping_method: input.shippingMethod,
    p_notes: null,
    p_items: input.items.map((i) => ({
      product_id: i.productId,
      size: i.size,
      qty: i.qty,
      is_combo: i.isCombo,
    })),
  });

  if (error) {
    return { ok: false, error: "No pudimos registrar tu pedido. Intenta de nuevo en unos minutos." };
  }

  return { ok: true, orderNumber: data as number };
}

export type SubmitContactInput = { name: string; email: string; phone: string; message: string };
export type SubmitContactResult = { ok: true } | { ok: false; error: string };

// Espejan los `check (char_length(...))` de la tabla contact_messages en
// supabase/schema.sql. Sin esto, un POST directo al Server Action con un
// mensaje de 100k caracteres solo se frenaba en Postgres y volvía como
// "no pudimos enviar tu mensaje", sin decir qué pasó.
const MAX_CONTACT_NAME = 35;
const MAX_CONTACT_EMAIL = 30;
const MAX_CONTACT_PHONE = 15;
const MAX_CONTACT_MESSAGE = 150;

export async function submitContact(input: SubmitContactInput): Promise<SubmitContactResult> {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const message = String(input.message ?? "").trim();

  if (!name || !email || !phone || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (name.length > MAX_CONTACT_NAME || email.length > MAX_CONTACT_EMAIL) {
    return { ok: false, error: "El nombre o el email son demasiado largos." };
  }
  if (phone.length > MAX_CONTACT_PHONE) {
    return { ok: false, error: `El número no puede pasar de ${MAX_CONTACT_PHONE} caracteres.` };
  }
  if (message.length > MAX_CONTACT_MESSAGE) {
    return { ok: false, error: `El mensaje no puede pasar de ${MAX_CONTACT_MESSAGE} caracteres.` };
  }
  // Validación deliberadamente laxa (un solo @, algo a cada lado, un punto
  // en el dominio): el email no se verifica ni se usa para autenticar,
  // solo para poder responder. Un regex "completo" rechaza direcciones
  // válidas raras y no aporta seguridad acá.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Ingresa un email válido." };
  }

  const { error } = await supabase.from("contact_messages").insert({ name, email, phone, message });
  if (error) {
    return { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo." };
  }

  await sendContactNotificationEmail({ name, email, phone, message });

  return { ok: true };
}
