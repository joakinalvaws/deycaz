"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { FLAT_COMBO_SIZE_PRICE, SIZES, formatPEN, type ComboSize } from "@/lib/pricing";
import {
  COMBO_CATEGORY_LABELS,
  MAX_QTY_PER_PAIR,
  getPairDiscount,
  groupComboPairs,
  isComboCategorySlug,
} from "@/lib/bundleDiscount";
import type { Category, Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { BundleDiscountSummary } from "./BundleDiscountSummary";
import { ComboPairTierHint } from "./ComboPairTierHint";
import { FreeShippingSummary } from "./FreeShippingSummary";

// Debe coincidir con el breakpoint `lg` de Tailwind (usado más abajo en
// `lg:grid-cols-[1fr_340px]`) — en desktop la zona TAMAÑO ya es visible sin
// scroll, así que el salto automático solo tiene sentido en mobile.
const DESKTOP_BREAKPOINT = 1024;

/** Solo para los badges de la burbuja flotante mobile — ahí no interesan
 * los centavos (los montos de combo siempre son enteros) y el espacio es
 * chico. `formatPEN` (2 decimales fijos) sigue siendo el formato en todo
 * el resto del sitio, sin tocar. */
function formatWholeSoles(amount: number): string {
  return Math.round(amount).toLocaleString("es-PE");
}

type SummaryPairRow = {
  categorySlug: string;
  size: ComboSize;
  products: Product[];
  subtotal: number;
  discount: number;
};

/** Contenido del resumen "TU COMBO" — se muestra tal cual en el panel lateral
 * de desktop y dentro de la hoja inferior de mobile, para no duplicar la
 * lógica/JSX entre las dos presentaciones. Un bloque por cada par
 * (categoría, tamaño) armado, con su propio subtotal/descuento, más el
 * total agregado de todos los pares. */
function ComboSummaryPanel({
  pairRows,
  totalCount,
  subtotal,
  discount,
  total,
  projectedSubtotal,
  onRemoveProduct,
  onRemoveGroup,
  onAddAnotherGroup,
  onConfirm,
  ready,
  error,
  onClose,
}: {
  pairRows: SummaryPairRow[];
  totalCount: number;
  subtotal: number;
  discount: number;
  total: number;
  projectedSubtotal: number;
  onRemoveProduct: (categorySlug: string, size: ComboSize, productId: number) => void;
  onRemoveGroup: (categorySlug: string, size: ComboSize) => void;
  onAddAnotherGroup: () => void;
  onConfirm: () => void;
  ready: boolean;
  error: string | null;
  onClose?: () => void;
}) {
  const pairs = pairRows.map((r) => ({ categorySlug: r.categorySlug, size: r.size, qty: r.products.length }));

  return (
    <>
      <div className="flex justify-between border-b border-[#2a2a28] px-5 py-4">
        <span className="text-xs font-bold tracking-wide">TU COMBO</span>
        <div className="flex items-center gap-3">
          <span className="text-muted-2 text-xs">{totalCount} items</span>
          {onClose && (
            <button type="button" onClick={onClose} className="-m-1 bg-transparent p-1 text-sm">
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-b border-[#f0efec] bg-white px-5 py-4 text-foreground">
        <BundleDiscountSummary pairs={pairs} />
        <FreeShippingSummary discountedSubtotal={projectedSubtotal} shippingMethod={null} />
      </div>
      <div className="min-h-20 bg-white px-5 py-4.5 text-foreground">
        {pairRows.length === 0 && (
          <p className="text-muted-2 my-5 text-center text-[13px] italic">Ningún perfume seleccionado aún</p>
        )}
        {pairRows.map((row) => (
          <div
            key={`${row.categorySlug}::${row.size}`}
            className="mb-4 border-b border-[#f0efec] pb-3 last:mb-0 last:border-b-0 last:pb-0"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-muted-2 text-[11px] font-bold tracking-wide">
                {isComboCategorySlug(row.categorySlug) ? COMBO_CATEGORY_LABELS[row.categorySlug] : row.categorySlug} ·{" "}
                {row.size}ML
              </span>
              <button
                type="button"
                onClick={() => onRemoveGroup(row.categorySlug, row.size)}
                className="text-muted-2 bg-transparent text-[12px]"
              >
                Quitar grupo
              </button>
            </div>
            {row.products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 text-[13px]">
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProduct(row.categorySlug, row.size, p.id)}
                  className="text-muted-2 bg-transparent text-[15px]"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="text-muted-2 mt-1.5 flex justify-between text-[12px]">
              <span>Subtotal ({row.products.length})</span>
              <span>
                S/. {formatPEN(row.subtotal)}
                {row.discount > 0 && <span className="text-success"> (-S/. {formatPEN(row.discount)})</span>}
              </span>
            </div>
          </div>
        ))}
        <div className="text-muted mt-2 flex justify-between text-[13px]">
          <span>Precio sin descuento</span>
          <span>S/. {formatPEN(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="mt-1.5 flex justify-between text-[13px] text-success">
            <span>Descuento</span>
            <span>-S/. {formatPEN(discount)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-5 py-4.5">
        <span className="text-xs font-bold tracking-wide">TOTAL A PAGAR</span>
        <span className="text-xl font-extrabold">S/. {formatPEN(total)}</span>
      </div>
      {error && <p className="px-5 pb-2 text-[12px] text-red-300">{error}</p>}
      <div className="flex flex-col gap-2 px-5 pb-5">
        <button
          type="button"
          onClick={onAddAnotherGroup}
          className="w-full border border-white/30 py-3.5 text-[13px] font-bold tracking-wide text-white"
        >
          AGREGAR OTRO GRUPO
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={onConfirm}
          className={`w-full py-4 text-[13px] font-bold tracking-wide ${
            ready ? "bg-success text-white" : "cursor-not-allowed bg-border-strong text-muted-2"
          }`}
        >
          FINALIZAR Y AGREGAR AL CARRITO
        </button>
      </div>
    </>
  );
}

type ComboGroup = { categorySlug: string; size: ComboSize; productIds: number[] };

export function ComboBuilder({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [groups, setGroups] = useState<ComboGroup[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [size, setSize] = useState<ComboSize | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);
  const { addItems, openCheckout, discountedSubtotal, items: cartItems } = useCart();

  // Solo las 4 categorías con tabla de descuento propia — antes era una
  // lista de exclusión ("todas menos damas/promos"), ahora es de inclusión
  // atada directamente a COMBO_PAIR_DISCOUNT_TABLE, así una futura 5ª
  // categoría nunca aparece seleccionable acá sin tener antes su fila en
  // la tabla de descuento.
  const comboCategories = categories.filter((c) => isComboCategorySlug(c.slug));

  const pool = useMemo(() => {
    if (!category) return [];
    const base = products.filter((p) => p.categorySlug === category);
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter((p) => p.name.toLowerCase().includes(q));
  }, [category, products, search]);

  const cartPairs = useMemo(() => groupComboPairs(cartItems), [cartItems]);
  function cartQtyForPair(catSlug: string, sz: ComboSize): number {
    return cartPairs.find((p) => p.categorySlug === catSlug && p.size === sz)?.qty ?? 0;
  }
  // Cuántas unidades más se pueden agregar a este par sin pasar el tope,
  // contando lo que ya está en el carrito (no solo la sesión en curso) —
  // si no, un pedido podría superar el tope real recién en el checkout.
  const remainingForCurrentPair =
    category && size ? Math.max(0, MAX_QTY_PER_PAIR - cartQtyForPair(category, size)) : MAX_QTY_PER_PAIR;

  // Grupos ya confirmados en esta sesión + el grupo en curso (si tiene algo
  // seleccionado), reemplazando el grupo existente del mismo par en vez de
  // duplicarlo — así el resumen se ve al instante sin esperar a "cerrar" el
  // grupo actual.
  const displayGroups = useMemo(() => {
    if (!category || !size) return groups;
    const idx = groups.findIndex((g) => g.categorySlug === category && g.size === size);
    if (idx >= 0) return groups.map((g, i) => (i === idx ? { ...g, productIds: selected } : g));
    if (selected.length === 0) return groups;
    return [...groups, { categorySlug: category, size, productIds: selected }];
  }, [groups, category, size, selected]);

  const pairRows: SummaryPairRow[] = useMemo(
    () =>
      displayGroups.map((g) => {
        const groupProducts = g.productIds
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        return {
          categorySlug: g.categorySlug,
          size: g.size,
          products: groupProducts,
          subtotal: groupProducts.length * FLAT_COMBO_SIZE_PRICE[g.size],
          discount: getPairDiscount(g.categorySlug, g.size, groupProducts.length),
        };
      }),
    [displayGroups, products],
  );

  const totalCount = pairRows.reduce((a, r) => a + r.products.length, 0);
  const subtotal = pairRows.reduce((a, r) => a + r.subtotal, 0);
  const discount = pairRows.reduce((a, r) => a + r.discount, 0);
  const total = subtotal - discount;
  const ready = totalCount >= 2;
  // Proyección de "cuánto me faltaría para envío gratis" si confirmo el
  // combo tal cual está — se suma a lo que ya hay en el carrito en vez de
  // mostrar solo el total de esta selección en curso, para no confundir a
  // alguien que ya tenía productos agregados antes de entrar acá.
  const projectedSubtotal = discountedSubtotal + total;

  const categoryZoneRef = useRef<HTMLDivElement>(null);
  const sizeZoneRef = useRef<HTMLDivElement>(null);
  const perfumesZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!category) return;
    // En desktop la zona TAMAÑO ya se ve sin necesidad de scroll, y el salto
    // automático se sentía brusco — el scroll automático queda solo para
    // mobile, donde sí hace falta para notar que se desbloqueó contenido.
    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    // "start" dejaba la sección pegada arriba del todo — como TAMAÑO es
    // corta, el resto de la pantalla quedaba vacío (a veces asomando el
    // footer del sitio detrás). "center" la deja a media pantalla: da
    // contexto de que hay un siguiente paso sin over-scrollear.
    sizeZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [category]);

  useEffect(() => {
    if (!size) return;
    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    perfumesZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [size]);

  function toggleProduct(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= remainingForCurrentPair) return prev;
      return [...prev, id];
    });
  }

  /** Guarda el grupo en curso dentro de `groups` (si tiene algo
   * seleccionado) — reemplaza la entrada existente del mismo par en vez de
   * unirla con la anterior, para que quitar un perfume y volver a entrar a
   * ese par no lo vuelva a traer. Devuelve el array resultante (además de
   * aplicarlo con setGroups) para poder encadenar lecturas en el mismo
   * evento sin esperar al próximo render. */
  function commitCurrentGroup(): ComboGroup[] {
    if (!category || !size || selected.length === 0) return groups;
    const idx = groups.findIndex((g) => g.categorySlug === category && g.size === size);
    const next =
      idx >= 0
        ? groups.map((g, i) => (i === idx ? { ...g, productIds: selected } : g))
        : [...groups, { categorySlug: category, size, productIds: selected }];
    setGroups(next);
    return next;
  }

  function switchTo(nextCategory: string | null, nextSize: ComboSize | null) {
    const committed = commitCurrentGroup();
    setCategory(nextCategory);
    setSize(nextSize);
    const existing =
      nextCategory && nextSize
        ? committed.find((g) => g.categorySlug === nextCategory && g.size === nextSize)
        : undefined;
    setSelected(existing ? existing.productIds : []);
    setSearch("");
    setPairError(null);
  }

  function selectCategory(slug: string) {
    switchTo(slug, null);
  }

  function addAnotherGroup() {
    switchTo(null, null);
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      categoryZoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function removeProductFromGroup(catSlug: string, sz: ComboSize, productId: number) {
    if (category === catSlug && size === sz) {
      setSelected((prev) => prev.filter((x) => x !== productId));
      return;
    }
    setGroups((prev) =>
      prev
        .map((g) =>
          g.categorySlug === catSlug && g.size === sz
            ? { ...g, productIds: g.productIds.filter((x) => x !== productId) }
            : g,
        )
        .filter((g) => g.productIds.length > 0),
    );
  }

  function removeGroup(catSlug: string, sz: ComboSize) {
    if (category === catSlug && size === sz) {
      setSelected([]);
      return;
    }
    setGroups((prev) => prev.filter((g) => !(g.categorySlug === catSlug && g.size === sz)));
  }

  function confirmCombo() {
    const finalGroups = commitCurrentGroup();
    const finalTotalCount = finalGroups.reduce((a, g) => a + g.productIds.length, 0);
    if (finalTotalCount < 2) return;

    const overCap = finalGroups.some(
      (g) => cartQtyForPair(g.categorySlug, g.size) + g.productIds.length > MAX_QTY_PER_PAIR,
    );
    if (overCap) {
      setPairError(
        "Ya tienes productos de esa categoría y tamaño en tu carrito — quita alguno para no pasar de 6 unidades.",
      );
      return;
    }

    const toAdd = finalGroups.flatMap((g) =>
      g.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p)
        .map((p) => ({
          productId: p.id,
          name: p.name,
          categorySlug: g.categorySlug,
          size: g.size,
          unitPrice: FLAT_COMBO_SIZE_PRICE[g.size],
          qty: 1,
          isCombo: true,
        })),
    );
    addItems(toAdd);
    setGroups([]);
    setCategory(null);
    setSize(null);
    setSelected([]);
    setSearch("");
    setPairError(null);
    // Va directo al formulario de checkout (no al carrito): ahí la lista de
    // pedido es de solo lectura, así que el descuento ya calculado por par
    // no se puede desincronizar ajustando cantidades o quitando items uno
    // por uno, como sí podía pasar en el carrito.
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
          <div ref={categoryZoneRef} className="scroll-mt-4">
            <div className="text-muted-2 mb-4.5 border-b border-[#e2e0dc] pb-2.5 text-[11px] font-bold tracking-wide">
              CATEGORÍA
            </div>
            <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
              {comboCategories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => selectCategory(c.slug)}
                  className={`rounded-md border px-2.5 py-2.5 text-center md:px-4 md:py-4 ${
                    category === c.slug
                      ? "border-foreground bg-foreground text-white"
                      : "border-[#e2e0dc] bg-white"
                  }`}
                >
                  <div className="mb-0.5 text-[10px] opacity-70 md:mb-1 md:text-xs">{c.subtitle}</div>
                  <div className="text-sm font-extrabold tracking-wide md:text-[19px]">{c.name}</div>
                  <div className="mt-0.5 text-[10px] opacity-70 md:mt-1 md:text-xs">Desde S/. {c.desde}</div>
                </button>
              ))}
            </div>
          </div>

          {category && (
            <div ref={sizeZoneRef} className="scroll-mt-4">
              <div className="text-muted-2 mb-4.5 border-b border-[#e2e0dc] pb-2.5 text-[11px] font-bold tracking-wide">
                TAMAÑO
              </div>
              <div className="mb-6 grid grid-cols-3 gap-2 md:gap-4">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => switchTo(category, sz)}
                    className={`rounded-md border px-2.5 py-2.5 text-center md:px-4 md:py-4 ${
                      size === sz ? "border-foreground bg-foreground text-white" : "border-[#e2e0dc] bg-white"
                    }`}
                  >
                    <div className="text-lg font-extrabold md:text-2xl">{sz}ML</div>
                    <div className="mt-0.5 text-[10px] opacity-70 md:mt-1 md:text-xs">
                      Individual S/. {formatPEN(FLAT_COMBO_SIZE_PRICE[sz])}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-7 flex items-center justify-between border border-[#e2e0dc] bg-white px-6 py-4.5">
            <div>
              <span className="text-xl font-extrabold">{selected.length}</span>{" "}
              <span className="text-muted-2 text-[13px]">seleccionados</span>
            </div>
            <div className="text-muted-2 text-[13px]">Selecciona mínimo 2 para el descuento</div>
          </div>

          {category && size && (
            <div ref={perfumesZoneRef} className="scroll-mt-4 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_340px]">
              <div>
                <div className="mb-4.5">
                  <ComboPairTierHint categorySlug={category} size={size} qty={selected.length} />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar perfume..."
                  className="mb-4.5 w-full border border-[#e2e0dc] bg-white px-4 py-3.5 text-[13px] outline-none"
                />
                {remainingForCurrentPair === 0 && (
                  <p className="text-muted-2 mb-4 text-[13px] font-semibold">
                    Llegaste al máximo de 6 unidades para esta categoría y tamaño.
                  </p>
                )}
                <div className="grid max-h-[520px] grid-cols-2 gap-4 overflow-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                  {pool.map((p) => {
                    const isSelected = selected.includes(p.id);
                    const disabled = !isSelected && selected.length >= remainingForCurrentPair;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        disabled={disabled}
                        className={`relative border border-[#e2e0dc] bg-white p-3.5 text-left ${
                          disabled ? "cursor-not-allowed opacity-40" : ""
                        }`}
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

              <div className="hidden h-fit bg-foreground text-white lg:block">
                <ComboSummaryPanel
                  pairRows={pairRows}
                  totalCount={totalCount}
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  projectedSubtotal={projectedSubtotal}
                  onRemoveProduct={removeProductFromGroup}
                  onRemoveGroup={removeGroup}
                  onAddAnotherGroup={addAnotherGroup}
                  onConfirm={confirmCombo}
                  ready={ready}
                  error={pairError}
                />
              </div>

              <div className="lg:hidden">
                <div className="fixed right-5 bottom-5 z-40 h-14 w-14">
                  {/* Total: pegado a la burbuja (right-12 solapa ~8px con el
                      círculo, sin separarse), pero ese solape cae dentro del
                      padding derecho del badge (pr-4=16px) — no en el
                      número — así el monto no queda rozando el borde. */}
                  <span className="absolute top-1/2 right-12 z-0 -translate-y-1/2 rounded-md bg-foreground py-1.5 pr-4 pl-2.5 text-[11px] font-bold whitespace-nowrap text-white shadow-md">
                    S/. {formatWholeSoles(total)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setMobileSummaryOpen(true)}
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8e6e1] text-2xl shadow-lg"
                  >
                    🛒
                  </button>

                  {/* Descuento: rectángulo con esquinas redondeadas arriba a
                      la derecha, comiendo un poco el borde de la burbuja. */}
                  {discount > 0 && (
                    <span className="bg-success absolute -top-2 -right-2.5 z-20 rounded-md px-1 py-0.5 text-[9px] font-bold whitespace-nowrap text-white shadow">
                      -S/. {formatWholeSoles(discount)}
                    </span>
                  )}

                  {/* Cantidad de items: circulito chico abajo a la derecha,
                      se mezcla con la burbuja pero casi no se nota. */}
                  {totalCount > 0 && (
                    <span className="absolute -right-0.5 -bottom-0.5 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-[#d8d6d2] bg-white text-[10px] font-bold text-foreground">
                      {totalCount}
                    </span>
                  )}
                </div>

                {mobileSummaryOpen && (
                  <>
                    <div
                      onClick={() => setMobileSummaryOpen(false)}
                      className="fixed inset-0 z-170 bg-black/40"
                    />
                    <div className="fixed inset-x-0 bottom-0 z-171 max-h-[85vh] overflow-auto rounded-t-2xl bg-foreground text-white">
                      <ComboSummaryPanel
                        pairRows={pairRows}
                        totalCount={totalCount}
                        subtotal={subtotal}
                        discount={discount}
                        total={total}
                        projectedSubtotal={projectedSubtotal}
                        onRemoveProduct={removeProductFromGroup}
                        onRemoveGroup={removeGroup}
                        onAddAnotherGroup={() => {
                          setMobileSummaryOpen(false);
                          addAnotherGroup();
                        }}
                        onConfirm={() => {
                          setMobileSummaryOpen(false);
                          confirmCombo();
                        }}
                        ready={ready}
                        error={pairError}
                        onClose={() => setMobileSummaryOpen(false)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
