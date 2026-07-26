import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { ProductForm } from "@/modules/admin/products/components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", Number(id)).single();
  if (!product) notFound();

  return (
    <div>
      <PageHeader title={product.name} />
      <ProductForm product={product} />
    </div>
  );
}
