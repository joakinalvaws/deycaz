"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { FLAT_COMBO_SIZE_PRICE, SIZES, formatPEN, type Size } from "@/lib/pricing";
import { getBundleDiscount } from "@/lib/bundleDiscount";
import type { Category, Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { BundleDiscountSummary } from "./BundleDiscountSummary";

export function ComboBuilder({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const { addItems, openCheckout } = useCart();

  const comboCategories = categories.filter((c) => c.slug !== "promos");

  const pool = useMemo(() => {
    if (!category) return [];
    const base = products.filter((p) => p.categorySlug === category);
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter((p) => p.name.toLowerCase().includes(q));
  }, [category, products, search]);

  const selectedProducts = selected
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  const count = selected.length;
  const flatPrice = size ? FLAT_COMBO_SIZE_PRICE[size] : 0;
  const subtotal = count * flatPrice;
  const discount = getBundleDiscount(count);
  const total = subtotal - discount;
  const ready = count >= 2 && !!size;

  const sizeZoneRef = useRef<HTMLDivElement>(null);
  const perfumesZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (category) sizeZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category]);

  useEffect(() => {
    if (size) perfumesZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [size]);

  function toggleProduct(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectCategory(slug: string) {
    setCategory(slug);
    setSize(null);
    setSelected([]);
    setSearch("");
  }

  function confirmCombo() {
    if (!ready || !size) return;
    const unitPrice = FLAT_COMBO_SIZE_PRICE[size];
    addItems(
      selectedProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        categorySlug: p.categorySlug,
        size,
        unitPrice,
        qty: 1,
        isCombo: true,
      })),
    );
    setCategory(null);
    setSize(null);
    setSelected([]);
    setSearch("");
    // Va directo al formulario de checkout (no al carrito): ahí la lista de
    // pedido es de solo lectura, así que el descuento por cantidad ya
    // calculado para el combo no se puede desincronizar ajustando
    // cantidades o quitando items uno por uno, como sí podía pasar en el
    // carrito.
    openCheckout();
  }

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-6 pt-10 pb-5 text-center md:px-10">
        <h1 className="font-display text-4xl tracking-wide md:text-[46px]">ARMA TU COMBO</h1>
        <p className="text-muted my-2.5 text-sm">Elige tus decants favoritos y ahorra automáticamente</p>
        <div className="flex items-center justify-center gap-3.5 text-[13px] font-semibold">
          <span className="font-extrabold">① CATEGORÍA</span>
          <span className="h-px w-10 bg-border-strong" />
          <span className={category ? "font-extrabold" : "text-muted-2"}>② TAMAÑO</span>
          <span className="h-px w-10 bg-border-strong" />
          <span className={category && size ? "font-extrabold" : "text-muted-2"}>③ PERFUMES</span>
        </div>
      </section>

      <section className="bg-cream px-6 py-9 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-muted-2 mb-4.5 border-b border-[#e2e0dc] pb-2.5 text-[11px] font-bold tracking-wide">
            CATEGORÍA
          </div>
          <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {comboCategories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCategory(c.slug)}
                className={`border px-5 py-6.5 text-center ${
                  category === c.slug
                    ? "border-foreground bg-foreground text-white"
                    : "border-[#e2e0dc] bg-white"
                }`}
              >
                <div className="mb-2 text-xs opacity-70">{c.subtitle}</div>
                <div className="text-[19px] font-extrabold tracking-wide">{c.name}</div>
                <div className="mt-2 text-xs opacity-70">Desde S/. {c.desde}</div>
              </button>
            ))}
          </div>

          {category && (
            <div ref={sizeZoneRef} className="scroll-mt-4">
              <div className="text-muted-2 mb-4.5 border-b border-[#e2e0dc] pb-2.5 text-[11px] font-bold tracking-wide">
                TAMAÑO
              </div>
              <div className="mb-6 grid grid-cols-3 gap-5">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`border px-5 py-6.5 text-center ${
                      size === sz ? "border-foreground bg-foreground text-white" : "border-[#e2e0dc] bg-white"
                    }`}
                  >
                    <div className="text-2xl font-extrabold">{sz}ML</div>
                    <div className="mt-1.5 text-xs opacity-70">
                      Individual S/. {formatPEN(FLAT_COMBO_SIZE_PRICE[sz])}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-7 flex items-center justify-between border border-[#e2e0dc] bg-white px-6 py-4.5">
            <div>
              <span className="text-xl font-extrabold">{count}</span>{" "}
              <span className="text-muted-2 text-[13px]">seleccionados</span>
            </div>
            <div className="text-muted-2 text-[13px]">Selecciona mínimo 2 para el descuento</div>
          </div>

          {category && size && (
            <div ref={perfumesZoneRef} className="scroll-mt-4 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_340px]">
              <div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar perfume..."
                  className="mb-4.5 w-full border border-[#e2e0dc] bg-white px-4 py-3.5 text-[13px] outline-none"
                />
                <div className="grid max-h-[520px] grid-cols-2 gap-4 overflow-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                  {pool.map((p) => {
                    const isSelected = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="relative border border-[#e2e0dc] bg-white p-3.5 text-left"
                      >
                        <span
                          className={`absolute top-2.5 right-2.5 h-4 w-4 rounded-full border-2 ${
                            isSelected ? "border-foreground bg-foreground" : "border-[#d8d6d2] bg-white"
                          }`}
                        />
                        <div className="relative mb-2.5 aspect-square w-full bg-cream">
                          <ProductImage src={p.imageUrl} alt={p.name} sizes="140px" />
                        </div>
                        <div className="text-xs font-medium">{p.name}</div>
                      </button>
                    );
                  })}
                  {pool.length === 0 && (
                    <p className="text-muted-2 col-span-full py-6 text-center text-sm">
                      No hay perfumes que coincidan.
                    </p>
                  )}
                </div>
              </div>

              <div className="h-fit bg-foreground text-white">
                <div className="flex justify-between border-b border-[#2a2a28] px-5 py-4">
                  <span className="text-xs font-bold tracking-wide">TU COMBO</span>
                  <span className="text-muted-2 text-xs">{count} items</span>
                </div>
                <div className="min-h-20 bg-white px-5 py-4.5 text-foreground">
                  <div className="text-muted-2 mb-2.5 text-[11px] font-bold tracking-wide">
                    PERFUMES SELECCIONADOS
                  </div>
                  {selectedProducts.length === 0 && (
                    <p className="text-muted-2 my-5 text-center text-[13px] italic">
                      Ningún perfume seleccionado aún
                    </p>
                  )}
                  {selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border-b border-[#f0efec] py-2 text-[13px]"
                    >
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="text-muted-2 bg-transparent text-[15px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="text-muted mt-4 flex justify-between text-[13px]">
                    <span>Precio sin descuento</span>
                    <span>S/. {formatPEN(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="mt-1.5 flex justify-between text-[13px] text-success">
                      <span>Descuento</span>
                      <span>-S/. {formatPEN(discount)}</span>
                    </div>
                  )}
                  <div className="mt-3.5 border-t border-[#f0efec] pt-3.5">
                    <BundleDiscountSummary comboQty={count} />
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4.5">
                  <span className="text-xs font-bold tracking-wide">TOTAL A PAGAR</span>
                  <span className="text-xl font-extrabold">S/. {formatPEN(total)}</span>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={confirmCombo}
                    className={`w-full py-4 text-[13px] font-bold tracking-wide ${
                      ready ? "bg-success text-white" : "cursor-not-allowed bg-border-strong text-muted-2"
                    }`}
                  >
                    CONFIRMAR COMBO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
