"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import * as cartStore from "@/lib/cartStore";
import type { AddItemInput } from "@/lib/cartStore";
import type { CartItem } from "@/lib/types";
import { getBundleDiscount } from "@/lib/bundleDiscount";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  comboQty: number;
  bundleDiscount: number;
  discountedSubtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  checkoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  addItem: (input: AddItemInput) => void;
  addItems: (inputs: AddItemInput[]) => void;
  removeItem: (index: number) => void;
  changeQty: (index: number, delta: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const addItems = useCallback((inputs: AddItemInput[]) => {
    cartStore.addItems(inputs);
    setIsOpen(true);
  }, []);

  const addItem = useCallback((input: AddItemInput) => addItems([input]), [addItems]);
  const removeItem = useCallback((index: number) => cartStore.removeItem(index), []);
  const changeQty = useCallback((index: number, delta: number) => cartStore.changeQty(index, delta), []);
  const clear = useCallback(() => cartStore.clearCart(), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const count = useMemo(() => items.reduce((a, c) => a + c.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((a, c) => a + c.unitPrice * c.qty, 0), [items]);
  const comboQty = useMemo(
    () => items.filter((i) => i.isCombo).reduce((a, c) => a + c.qty, 0),
    [items],
  );
  const bundleDiscount = useMemo(() => getBundleDiscount(comboQty), [comboQty]);
  const discountedSubtotal = useMemo(
    () => Math.max(subtotal - bundleDiscount, 0),
    [subtotal, bundleDiscount],
  );

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    comboQty,
    bundleDiscount,
    discountedSubtotal,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    checkoutOpen,
    openCheckout,
    closeCheckout,
    addItem,
    addItems,
    removeItem,
    changeQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
