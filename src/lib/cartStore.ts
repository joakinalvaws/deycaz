import type { CartItem } from "./types";
import type { Size } from "./pricing";

const STORAGE_KEY = "deycaz.cart.v1";

export type AddItemInput = {
  productId: number;
  name: string;
  categorySlug: string;
  size: Size;
  unitPrice: number;
  qty?: number;
  isCombo?: boolean;
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
  return a.productId === b.productId && a.size === b.size && a.isCombo === !!b.isCombo;
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
