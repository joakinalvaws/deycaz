"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/modules/admin/shared/components/DataTable";
import { formatPEN } from "@/lib/pricing";
import type { DerivedCustomer } from "../types";

export function CustomersTable({ customers }: { customers: DerivedCustomer[] }) {
  const columns: ColumnDef<DerivedCustomer>[] = [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "phone", header: "Celular" },
    { accessorKey: "orderCount", header: "Pedidos" },
    {
      accessorKey: "totalSpent",
      header: "Total gastado",
      cell: ({ row }) => `S/. ${formatPEN(row.original.totalSpent)}`,
    },
    {
      accessorKey: "lastOrderAt",
      header: "Último pedido",
      cell: ({ row }) => new Date(row.original.lastOrderAt).toLocaleDateString("es-PE"),
    },
  ];

  return (
    <DataTable columns={columns} data={customers} getRowId={(c) => c.phone} emptyMessage="Sin clientes todavía." />
  );
}
