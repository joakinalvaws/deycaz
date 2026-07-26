"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/modules/admin/categories/hooks/useCategories";
import { CategoriesTable } from "@/modules/admin/categories/components/CategoriesTable";
import { CategoryFormDialog } from "@/modules/admin/categories/components/CategoryFormDialog";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import type { Category } from "@/modules/admin/categories/types";

export function CategoriesPageClient({ initialCategories }: { initialCategories: Category[] }) {
  const { data: categories } = useCategories();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Categorías del catálogo y de Arma tu Combo."
        actions={<Button onClick={() => setCreating(true)}>Nueva categoría</Button>}
      />
      <CategoriesTable categories={categories ?? initialCategories} />
      <CategoryFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
