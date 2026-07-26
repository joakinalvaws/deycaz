"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Sort = "default" | "asc" | "desc";

function SortButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3.5 py-2 text-xs font-semibold ${
        active ? "border-foreground bg-foreground text-white" : "border-border-strong bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export function SortableProductGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<Sort>("default");

  const sorted = useMemo(() => {
    if (sort === "asc") return [...products].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [products, sort]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <span className="text-muted text-[13px]">{products.length} artículos</span>
        <div className="flex gap-2.5">
          <SortButton active={sort === "default"} label="RELEVANCIA" onClick={() => setSort("default")} />
          <SortButton active={sort === "asc"} label="PRECIO ↑" onClick={() => setSort("asc")} />
          <SortButton active={sort === "desc"} label="PRECIO ↓" onClick={() => setSort("desc")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {sorted.length === 0 && (
          <p className="text-muted col-span-full py-10 text-center text-sm">
            Todavía no hay productos en esta categoría.
          </p>
        )}
      </div>
    </>
  );
}
