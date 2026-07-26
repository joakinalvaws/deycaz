"use client";

import { useCart } from "@/context/CartContext";
import { formatPEN } from "@/lib/pricing";
import { BundleDiscountSummary } from "./BundleDiscountSummary";
import { FreeShippingSummary } from "./FreeShippingSummary";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, changeQty, comboQty, discountedSubtotal, openCheckout } =
    useCart();

  if (!isOpen) return null;

  return (
    <>
      <div onClick={closeCart} className="fixed inset-0 z-150 bg-black/40" />
      <div className="fixed top-0 right-0 bottom-0 z-151 flex w-full max-w-[400px] flex-col bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <span className="text-[15px] font-bold">TU CARRITO ({items.reduce((a, c) => a + c.qty, 0)})</span>
          <button type="button" onClick={closeCart} className="-m-2 bg-transparent p-2 text-lg">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-2.5">
          {items.length === 0 && (
            <p className="text-muted-2 mt-16 text-center text-[13px]">Tu carrito está vacío</p>
          )}
          {items.map((item, i) => (
            <div key={`${item.productId}-${item.size}-${item.isCombo}-${i}`} className="flex gap-3.5 border-b border-[#f0efec] py-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold">
                  {item.name}
                  {item.isCombo && (
                    <span className="rounded-full bg-cream px-1.5 py-0.5 text-[10px] font-bold text-muted">
                      COMBO
                    </span>
                  )}
                </div>
                <div className="text-muted-2 mb-2 text-xs">
                  {item.size}ML · S/. {formatPEN(item.unitPrice)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 border border-border-strong">
                    <button type="button" onClick={() => changeQty(i, -1)} className="w-6 bg-transparent text-sm">
                      −
                    </button>
                    <span className="text-xs">{item.qty}</span>
                    <button type="button" onClick={() => changeQty(i, 1)} className="w-6 bg-transparent text-sm">
                      +
                    </button>
                  </div>
                  <span className="text-[13px] font-bold">S/. {formatPEN(item.unitPrice * item.qty)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-muted-2 self-start bg-transparent text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-5">
          {comboQty > 0 && (
            <div className="mb-4">
              <BundleDiscountSummary comboQty={comboQty} />
            </div>
          )}
          <div className="mb-4">
            <FreeShippingSummary discountedSubtotal={discountedSubtotal} shippingMethod={null} />
          </div>
          <div className="mb-4 flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>S/. {formatPEN(discountedSubtotal)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              closeCart();
              openCheckout();
            }}
            className={`block w-full py-4 text-center text-[13px] font-bold tracking-wide text-white ${
              items.length === 0 ? "cursor-not-allowed bg-border-strong text-muted-2" : "bg-foreground"
            }`}
          >
            CONFIRMAR COMPRA
          </button>
        </div>
      </div>
    </>
  );
}
