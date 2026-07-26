"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/modules/admin/shared/components/DataTable";
import { OrderStatusBadge } from "@/modules/admin/shared/components/StatusBadge";
import { formatPEN } from "@/lib/pricing";
import type { Order } from "../types";

const SHIPPING_LABEL: Record<Order["shipping_method"], string> = {
  lima_delivery: "Delivery (Lima)",
  shalom_provincia: "Shalom (Provincia)",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();

  const columns: ColumnDef<Order>[] = [
    { accessorKey: "order_number", header: "Pedido" },
    { accessorKey: "customer_name", header: "Cliente" },
    { accessorKey: "customer_phone", header: "Celular" },
    {
      id: "shipping",
      header: "Envío",
      cell: ({ row }) => SHIPPING_LABEL[row.original.shipping_method],
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => `S/. ${formatPEN(row.original.total)}`,
    },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("es-PE"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(o) => o.id}
      emptyMessage="Sin pedidos."
      onRowClick={(order) => router.push(`/admin/pedidos/${order.id}`)}
    />
  );
}
