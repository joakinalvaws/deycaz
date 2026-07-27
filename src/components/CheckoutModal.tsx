"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPEN, sizeLabel } from "@/lib/pricing";
import { estimateShippingCost, type ShippingMethod } from "@/lib/shipping";
import {
  getProvincias,
  getDistritos,
  getDistritosLimaMetropolitana,
  LIMA_METRO_PROVINCIA_IDS,
  type Provincia,
  type Distrito,
} from "@/lib/ubigeo";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { placeOrder } from "@/app/actions";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { BundleDiscountSummary } from "./BundleDiscountSummary";
import { FreeShippingSummary } from "./FreeShippingSummary";

type FieldKey = "nombre" | "celular" | "dni" | "provincia" | "distrito" | "direccion" | "shalomAgency";

/** Orden de campos actualmente visible según el método de envío elegido —
 * espeja el orden real del JSX de abajo, para que el avance de foco nunca
 * salte a un campo que no está siquiera renderizado. */
function getOrderedFieldKeys(shippingMethod: ShippingMethod | null): FieldKey[] {
  const keys: FieldKey[] = ["nombre", "celular"];
  if (shippingMethod === "shalom_provincia") {
    keys.push("dni", "provincia", "distrito");
  } else if (shippingMethod === "lima_delivery") {
    keys.push("distrito");
  }
  keys.push("direccion");
  if (shippingMethod === "shalom_provincia") {
    keys.push("shalomAgency");
  }
  return keys;
}

export function CheckoutModal() {
  const {
    items,
    subtotal,
    discountedSubtotal,
    bundleDiscount,
    comboQty,
    checkoutOpen,
    closeCheckout,
    clear,
  } = useCart();

  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});
  function focusNext(currentKey: FieldKey, method: ShippingMethod | null) {
    const order = getOrderedFieldKeys(method);
    const nextKey = order[order.indexOf(currentKey) + 1];
    const el = nextKey ? fieldRefs.current[nextKey] : null;
    // Enfocar un <select> por JS no abre su picker nativo en mobile, así que
    // el avance automático nunca sirve de mucho ahí — se deja que el usuario
    // lo toque él mismo, y el avance sigue funcionando entre campos de texto.
    if (!el || el.tagName === "SELECT") return;
    el.focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  // El teclado virtual del celular puede tapar el campo recién enfocado (el
  // modal es `fixed` + centrado, no repagina solo). Se espera a que termine
  // de abrirse (~300ms) y se lo vuelve a traer a la vista.
  function scrollFieldIntoView(el: HTMLElement | null) {
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  }

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [dni, setDni] = useState("");
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [provinciaId, setProvinciaId] = useState("");
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [limaDistritos, setLimaDistritos] = useState<Distrito[]>([]);
  const [distritoId, setDistritoId] = useState("");
  const [direccion, setDireccion] = useState("");
  const [shalomAgency, setShalomAgency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isShalom = shippingMethod === "shalom_provincia";
  const isLima = shippingMethod === "lima_delivery";

  // Cada método de envío tiene su propia lógica de ubicación (Lima no pide
  // provincia, Shalom sí). Al cambiar de método se descarta la selección de
  // ubicación anterior — ajustado durante el render en vez de en un efecto,
  // para no encadenar un setState síncrono dentro de él.
  const [locationResetFor, setLocationResetFor] = useState(shippingMethod);
  if (shippingMethod !== locationResetFor) {
    setLocationResetFor(shippingMethod);
    setProvinciaId("");
    setDistritoId("");
    setDistritos([]);
  }

  const [distritosLoadedFor, setDistritosLoadedFor] = useState(provinciaId);
  if (provinciaId !== distritosLoadedFor) {
    setDistritosLoadedFor(provinciaId);
    setDistritoId("");
    setDistritos([]);
  }

  useEffect(() => {
    if (isShalom && provincias.length === 0) {
      getProvincias().then(setProvincias);
    }
  }, [isShalom, provincias.length]);

  useEffect(() => {
    if (isLima && limaDistritos.length === 0) {
      getDistritosLimaMetropolitana().then(setLimaDistritos);
    }
  }, [isLima, limaDistritos.length]);

  useEffect(() => {
    if (!isShalom || !provinciaId) return;
    let active = true;
    getDistritos(provinciaId).then((d) => {
      if (active) setDistritos(d);
    });
    return () => {
      active = false;
    };
  }, [isShalom, provinciaId]);

  const shippingCost = shippingMethod ? estimateShippingCost(shippingMethod, discountedSubtotal) : 0;
  const total = discountedSubtotal + shippingCost;

  const provinciasParaShalom = useMemo(
    () => provincias.filter((p) => !LIMA_METRO_PROVINCIA_IDS.includes(p.id)),
    [provincias],
  );

  const provinciaNombre = isLima ? "Lima" : (provincias.find((p) => p.id === provinciaId)?.nombre ?? "");
  const distritoNombre = isLima
    ? (limaDistritos.find((d) => d.id === distritoId)?.nombre ?? "")
    : (distritos.find((d) => d.id === distritoId)?.nombre ?? "");

  const comboItems = items.filter((i) => i.isCombo);
  const individualItems = items.filter((i) => !i.isCombo);
  const comboSubtotal = comboItems.reduce((a, c) => a + c.unitPrice * c.qty, 0);

  const canSubmit = useMemo(() => {
    if (!shippingMethod || !nombre.trim() || !celular.trim() || !distritoId || !direccion.trim()) {
      return false;
    }
    if (isShalom) {
      if (!provinciaId) return false;
      if (!/^\d{8}$/.test(dni.trim()) || !shalomAgency.trim()) return false;
    }
    return true;
  }, [shippingMethod, nombre, celular, distritoId, direccion, isShalom, provinciaId, dni, shalomAgency]);

  if (!checkoutOpen) return null;

  function reset() {
    setShippingMethod(null);
    setNombre("");
    setCelular("");
    setDni("");
    setProvinciaId("");
    setDistritoId("");
    setDireccion("");
    setShalomAgency("");
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || submitting || !shippingMethod) return;
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      customerName: nombre,
      customerPhone: celular,
      shippingMethod,
      dni: isShalom ? dni : undefined,
      provincia: provinciaNombre,
      distrito: distritoNombre,
      customerAddress: direccion,
      shalomAgency: isShalom ? shalomAgency : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        qty: i.qty,
        isCombo: i.isCombo,
      })),
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const message = buildOrderWhatsAppMessage({
      orderNumber: result.orderNumber,
      nombre,
      dni: isShalom ? dni : "",
      celular,
      items,
      total,
      shippingMethod,
      direccion,
      distrito: distritoNombre,
      provincia: provinciaNombre,
      shalomAgency,
    });

    clear();
    reset();
    window.location.href = buildWhatsAppUrl(WHATSAPP_NUMBER, message);
  }

  return (
    <>
      <div onClick={closeCheckout} className="fixed inset-0 z-200 bg-black/50" />
      <div className="fixed inset-0 z-201 flex items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <div className="text-lg font-bold">¡Ya casi está!</div>
              <div className="text-muted text-[13px]">Completa tus datos para confirmar tu pedido.</div>
            </div>
            <button type="button" onClick={closeCheckout} className="-m-2 bg-transparent p-2 text-lg">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">
            <div className="mb-6">
              <div className="text-muted mb-2 text-xs font-bold tracking-wide">TU PEDIDO</div>

              {comboItems.length > 0 && (
                <div className="mb-3 border border-foreground bg-cream p-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span>🎁 Tu Combo · {comboQty} decants</span>
                  </div>
                  <div className="mb-2.5 border-b border-border-strong pb-2.5">
                    <BundleDiscountSummary
                      comboQty={comboQty}
                      maxTierMessage="🏆 Ya obtuviste el mayor descuento disponible."
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {comboItems.map((item, i) => (
                      <div key={`combo-${i}`} className="flex justify-between text-[13px]">
                        <span>
                          {item.qty}× {item.name} ({sizeLabel(item.size)})
                        </span>
                        <span className="font-medium">S/. {formatPEN(item.unitPrice * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border-strong pt-2 text-[13px] font-bold">
                    <span>Subtotal combo</span>
                    <span>S/. {formatPEN(comboSubtotal)}</span>
                  </div>
                </div>
              )}

              {individualItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  {individualItems.map((item, i) => (
                    <div key={`ind-${i}`} className="flex justify-between text-[13px]">
                      <span>
                        {item.qty}× {item.name} ({sizeLabel(item.size)})
                      </span>
                      <span className="font-medium">S/. {formatPEN(item.unitPrice * item.qty)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-muted mb-2 text-xs font-bold tracking-wide">MÉTODO DE ENVÍO</div>
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-3 border border-border-strong p-3.5">
                  <input
                    type="radio"
                    name="shipping"
                    checked={isLima}
                    onChange={() => setShippingMethod("lima_delivery")}
                  />
                  <span className="text-sm">Delivery (Lima)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 border border-border-strong p-3.5">
                  <input
                    type="radio"
                    name="shipping"
                    checked={isShalom}
                    onChange={() => setShippingMethod("shalom_provincia")}
                  />
                  <span className="text-sm">Shalom (Provincia)</span>
                </label>
              </div>
            </div>

            <div className="mb-6 border border-border bg-cream p-4 text-[13px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>S/. {formatPEN(subtotal)}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="mt-1 flex justify-between text-success">
                  <span>Descuento combo</span>
                  <span>-S/. {formatPEN(bundleDiscount)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between">
                <span>Envío</span>
                <span>
                  {!shippingMethod
                    ? "—"
                    : isShalom
                      ? "Se paga en la agencia Shalom"
                      : `S/. ${formatPEN(shippingCost)}`}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border-strong pt-2 font-bold">
                <span>Total a pagar</span>
                <span>S/. {formatPEN(total)}</span>
              </div>
            </div>

            <div className="mb-6 border border-border p-4">
              <FreeShippingSummary discountedSubtotal={discountedSubtotal} shippingMethod={shippingMethod} />
            </div>

            <div className="flex flex-col gap-3">
              <input
                ref={(el) => {
                  fieldRefs.current.nombre = el;
                }}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    focusNext("nombre", shippingMethod);
                  }
                }}
                onFocus={(e) => scrollFieldIntoView(e.target)}
                placeholder="Nombre completo"
                maxLength={50}
                className="border border-border-strong px-3.5 py-3 text-sm outline-none"
              />
              <input
                ref={(el) => {
                  fieldRefs.current.celular = el;
                }}
                value={celular}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setCelular(digits);
                  if (digits.length === 9) focusNext("celular", shippingMethod);
                }}
                onFocus={(e) => scrollFieldIntoView(e.target)}
                placeholder="Celular con WhatsApp"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                className="border border-border-strong px-3.5 py-3 text-sm outline-none"
              />

              {isShalom && (
                <input
                  ref={(el) => {
                    fieldRefs.current.dni = el;
                  }}
                  value={dni}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setDni(digits);
                    if (digits.length === 8) focusNext("dni", shippingMethod);
                  }}
                  onFocus={(e) => scrollFieldIntoView(e.target)}
                  placeholder="DNI"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  className="border border-border-strong px-3.5 py-3 text-sm outline-none"
                />
              )}

              {!shippingMethod && (
                <p className="text-muted-2 border border-dashed border-border-strong p-3.5 text-center text-sm italic">
                  Elige un método de envío para continuar.
                </p>
              )}

              {isLima && (
                <select
                  ref={(el) => {
                    fieldRefs.current.distrito = el;
                  }}
                  value={distritoId}
                  onChange={(e) => {
                    setDistritoId(e.target.value);
                    if (e.target.value) focusNext("distrito", shippingMethod);
                  }}
                  className="border border-border-strong bg-white px-3.5 py-3 text-sm outline-none"
                >
                  <option value="">
                    {limaDistritos.length === 0 ? "Cargando distritos..." : "Selecciona tu distrito (Lima/Callao)"}
                  </option>
                  {limaDistritos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              )}

              {isShalom && (
                <>
                  <select
                    ref={(el) => {
                      fieldRefs.current.provincia = el;
                    }}
                    value={provinciaId}
                    onChange={(e) => {
                      setProvinciaId(e.target.value);
                      if (e.target.value) focusNext("provincia", shippingMethod);
                    }}
                    className="border border-border-strong bg-white px-3.5 py-3 text-sm outline-none"
                  >
                    <option value="">
                      {provinciasParaShalom.length === 0 ? "Cargando provincias..." : "Selecciona provincia"}
                    </option>
                    {provinciasParaShalom.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.etiqueta}
                      </option>
                    ))}
                  </select>

                  <select
                    ref={(el) => {
                    fieldRefs.current.distrito = el;
                  }}
                    value={distritoId}
                    onChange={(e) => {
                      setDistritoId(e.target.value);
                      if (e.target.value) focusNext("distrito", shippingMethod);
                    }}
                    disabled={!provinciaId}
                    className="border border-border-strong bg-white px-3.5 py-3 text-sm outline-none disabled:bg-cream"
                  >
                    <option value="">
                      {!provinciaId
                        ? "Primero elige provincia"
                        : distritos.length === 0
                          ? "Cargando distritos..."
                          : "Selecciona distrito"}
                    </option>
                    {distritos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <textarea
                ref={(el) => {
                  fieldRefs.current.direccion = el;
                }}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    focusNext("direccion", shippingMethod);
                  }
                }}
                onFocus={(e) => scrollFieldIntoView(e.target)}
                placeholder="Dirección completa"
                rows={2}
                maxLength={100}
                className="resize-vertical border border-border-strong px-3.5 py-3 text-sm outline-none"
              />

              {isShalom && (
                <input
                  ref={(el) => {
                    fieldRefs.current.shalomAgency = el;
                  }}
                  value={shalomAgency}
                  onChange={(e) => setShalomAgency(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  onFocus={(e) => scrollFieldIntoView(e.target)}
                  placeholder="Agencia Shalom (provincia)"
                  className="border border-border-strong px-3.5 py-3 text-sm outline-none"
                />
              )}
            </div>

            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
          </div>

          <div className="border-t border-border px-6 py-5">
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="w-full bg-foreground py-4 text-sm font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-muted-2"
            >
              {submitting ? "Enviando..." : `Confirmar pedido — S/. ${formatPEN(total)}`}
            </button>
            <p className="text-muted-2 mt-3 text-center text-xs">100% confiables — se coordina por WhatsApp</p>
          </div>
        </div>
      </div>
    </>
  );
}
