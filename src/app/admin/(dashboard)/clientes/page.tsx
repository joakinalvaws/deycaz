import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { CustomersTable } from "@/modules/admin/customers/components/CustomersTable";
import type { DerivedCustomer } from "@/modules/admin/customers/types";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, total, created_at")
    .order("created_at", { ascending: false });

  const byPhone = new Map<string, DerivedCustomer>();
  for (const o of orders ?? []) {
    const existing = byPhone.get(o.customer_phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      if (o.created_at > existing.lastOrderAt) {
        existing.lastOrderAt = o.created_at;
        existing.name = o.customer_name;
      }
    } else {
      byPhone.set(o.customer_phone, {
        name: o.customer_name,
        phone: o.customer_phone,
        orderCount: 1,
        totalSpent: o.total,
        lastOrderAt: o.created_at,
      });
    }
  }
  const customers = Array.from(byPhone.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Derivado de los pedidos — todavía no existe una tabla de clientes propia (ver plan de arquitectura)."
      />
      <CustomersTable customers={customers} />
    </div>
  );
}
