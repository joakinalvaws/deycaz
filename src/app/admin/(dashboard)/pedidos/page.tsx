import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { OrdersListClient } from "./OrdersListClient";
import type { Order } from "@/modules/admin/orders/types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Pedidos" description="Pedidos confirmados por WhatsApp." />
      <OrdersListClient initialOrders={(data ?? []) as Order[]} />
    </div>
  );
}
