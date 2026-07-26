"use client";

import { useRef, type ReactNode } from "react";

export function ProductRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    ref.current?.scrollBy({ left: dir * 568, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-11 flex items-end justify-between">
        <h2 className="text-[22px] font-bold">Más Vendidos</h2>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="h-10 w-10 border border-border-strong bg-white text-[15px] leading-none"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="h-10 w-10 border border-border-strong bg-white text-[15px] leading-none"
          >
            →
          </button>
        </div>
      </div>
      <div ref={ref} className="scroll-smooth-x flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2.5">
        {children}
      </div>
    </div>
  );
}
