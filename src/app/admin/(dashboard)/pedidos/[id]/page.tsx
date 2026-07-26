import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { OrderDetail } from "@/modules/admin/orders/components/OrderDetail";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageHeader title="Detalle del pedido" />
      <OrderDetail orderId={id} />
    </div>
  );
}
