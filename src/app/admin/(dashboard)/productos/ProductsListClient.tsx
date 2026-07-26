"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/modules/admin/products/hooks/useProducts";
import { ProductsTable } from "@/modules/admin/products/components/ProductsTable";
import { useAdminUIStore } from "@/modules/admin/shared/stores/useAdminUIStore";
import type { Product } from "@/modules/admin/products/types";

export function ProductsListClient({ initialProducts }: { initialProducts: Product[] }) {
  const { productFilters, setProductFilters } = useAdminUIStore();
  const [search, setSearch] = useState("");

  const { data: products } = useProducts({ onlyActive: productFilters.onlyActive, search });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2">
          <Checkbox
            id="only-active"
            checked={productFilters.onlyActive}
            onCheckedChange={(checked) => setProductFilters({ onlyActive: checked === true })}
          />
          <Label htmlFor="only-active">Solo activos</Label>
        </div>
      </div>
      <ProductsTable products={products ?? initialProducts} />
    </div>
  );
}
