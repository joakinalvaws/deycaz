import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { ProductForm } from "@/modules/admin/products/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Nuevo producto" />
      <ProductForm />
    </div>
  );
}
