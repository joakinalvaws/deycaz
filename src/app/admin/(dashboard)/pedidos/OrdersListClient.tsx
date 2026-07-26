"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/modules/admin/orders/hooks/useOrders";
import { OrdersTable } from "@/modules/admin/orders/components/OrdersTable";
import { useAdminUIStore } from "@/modules/admin/shared/stores/useAdminUIStore";
import type { Order } from "@/modules/admin/orders/types";
import type { OrderStatus } from "@/modules/admin/shared/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export function OrdersListClient({ initialOrders }: { initialOrders: Order[] }) {
  const { orderFilters, setOrderFilters } = useAdminUIStore();

  const { data: orders } = useOrders({
    status: (orderFilters.status as OrderStatus) || null,
    shippingMethod: orderFilters.shippingMethod as "lima_delivery" | "shalom_provincia" | null,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select
          value={orderFilters.status ?? "all"}
          onValueChange={(value) => setOrderFilters({ status: value === "all" ? null : value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <OrdersTable orders={orders ?? initialOrders} />
    </div>
  );
}
