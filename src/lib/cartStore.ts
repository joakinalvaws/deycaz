import type { CartItem } from "./types";
import type { Size } from "./pricing";

// v2: los items de combo dejaron de guardar el unitPrice con el descuento ya
// incrustado (ver bundleDiscount.ts) — un carrito v1 persistido tendría
// precios ya descontados, y el nuevo cálculo de descuento a nivel de
// subtotal se aplicaría encima, duplicándolo. Bump de key para descartarlos.
const STORAGE_KEY = "deycaz.cart.v2";

export type AddItemInput = {
  productId: number;
  name: string;
  categorySlug: string;
  size: Size;
  unitPrice: number;
  qty?: number;
  isCombo?: boolean;
  isAddon?: boolean;
};

type Listener = () => void;

let items: CartItem[] = [];
let hydrated = false;
let listeners: Listener[] = [];

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage no disponible (modo privado, cuotas, etc.) — se ignora.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function setItems(next: CartItem[]) {
  items = next;
  persist();
  emit();
}

/** Lee el estado actual. Carga desde localStorage de forma perezosa la
 * primera vez que se llama en el navegador, para no tocar `window` durante
 * el render del servidor. */
export function getSnapshot(): CartItem[] {
  if (!hydrated && typeof window !== "undefined") {
    items = loadFromStorage();
    hydrated = true;
  }
  return items;
}

export function getServerSnapshot(): CartItem[] {
  return items;
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function sameLine(a: CartItem, b: AddItemInput) {
  return (
    a.productId === b.productId &&
    a.size === b.size &&
    a.isCombo === !!b.isCombo &&
    a.isAddon === !!b.isAddon
  );
}

export function addItems(inputs: AddItemInput[]) {
  const next = getSnapshot().slice();
  for (const input of inputs) {
    const idx = next.findIndex((line) => sameLine(line, input));
    if (idx >= 0) {
      next[idx] = { ...next[idx], qty: next[idx].qty + (input.qty ?? 1) };
    } else {
      next.push({
        productId: input.productId,
        name: input.name,
        categorySlug: input.categorySlug,
        size: input.size,
        unitPrice: input.unitPrice,
        qty: input.qty ?? 1,
        isCombo: !!input.isCombo,
        isAddon: !!input.isAddon,
      });
    }
  }
  setItems(next);
}

export function removeItem(index: number) {
  setItems(getSnapshot().filter((_, i) => i !== index));
}

export function changeQty(index: number, delta: number) {
  setItems(
    getSnapshot().map((line, i) => (i === index ? { ...line, qty: Math.max(1, line.qty + delta) } : line)),
  );
}

export function clearCart() {
  setItems([]);
}
