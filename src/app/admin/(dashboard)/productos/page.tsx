import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ProductsListClient } from "./ProductsListClient";
import type { Product } from "@/modules/admin/products/types";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catálogo de decants."
        actions={<Button render={<Link href="/admin/productos/nuevo" />}>Nuevo producto</Button>}
      />
      <ProductsListClient initialProducts={(data ?? []) as Product[]} />
    </div>
  );
}
