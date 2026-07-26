import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/modules/admin/shared/types";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ORDER_STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? "default" : "outline"}>{active ? "Activo" : "Inactivo"}</Badge>;
}
