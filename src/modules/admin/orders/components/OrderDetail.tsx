"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge } from "@/modules/admin/shared/components/StatusBadge";
import { formatPEN, sizeLabel } from "@/lib/pricing";
import { useOrder, useUpdateOrderStatus } from "../hooks/useOrders";
import type { OrderStatus } from "@/modules/admin/shared/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const SHIPPING_LABEL = { lima_delivery: "Delivery (Lima)", shalom_provincia: "Shalom (Provincia)" };

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Cargando…</p>;
  if (!order) return <p className="text-muted-foreground text-sm">Pedido no encontrado.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-2 text-sm last:border-b-0">
              <span>
                {item.qty}× {item.product_name} ({sizeLabel(item.size)})
                {item.is_combo && " · Combo"}
              </span>
              <span className="font-medium">S/. {formatPEN(item.unit_price * item.qty)}</span>
            </div>
          ))}
          <div className="mt-2 flex flex-col gap-1 border-t pt-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>S/. {formatPEN(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="text-muted-foreground flex justify-between">
                <span>Descuento</span>
                <span>-S/. {formatPEN(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>S/. {formatPEN(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>S/. {formatPEN(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <OrderStatusBadge status={order.status} />
            <Select
              value={order.status}
              onValueChange={(value) => {
                updateStatus.mutate(value as OrderStatus, {
                  onSuccess: () => toast.success("Estado actualizado."),
                  onError: () => toast.error("No se pudo actualizar el estado."),
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
            {order.dni && <p className="text-muted-foreground">DNI: {order.dni}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envío</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>{SHIPPING_LABEL[order.shipping_method]}</p>
            <p className="text-muted-foreground">{order.customer_address}</p>
            <p className="text-muted-foreground">
              {order.distrito}, {order.provincia}
            </p>
            {order.shalom_agency && <p className="text-muted-foreground">Agencia: {order.shalom_agency}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
