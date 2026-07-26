"use server";

import { supabase } from "@/lib/supabase";
import type { Size } from "@/lib/pricing";
import type { ShippingMethod } from "@/lib/shipping";

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
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
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

export type SubmitContactInput = { name: string; email: string; message: string };
export type SubmitContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(input: SubmitContactInput): Promise<SubmitContactResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Ingresa un email válido." };
  }

  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) {
    return { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo." };
  }
  return { ok: true };
}
