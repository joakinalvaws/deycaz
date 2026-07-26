"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/modules/admin/shared/components/DataTable";
import { ConfirmDialog } from "@/modules/admin/shared/components/ConfirmDialog";
import { ActiveBadge } from "@/modules/admin/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPEN } from "@/lib/pricing";
import { useDeleteProduct, useToggleProductActive } from "../hooks/useProducts";
import type { Product } from "../types";

export function ProductsTable({ products }: { products: Product[] }) {
  const toggleActive = useToggleProductActive();
  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      id: "image",
      header: "",
      cell: ({ row }) => (
        <div className="bg-muted relative size-10 overflow-hidden rounded">
          {row.original.image_url && (
            <Image src={row.original.image_url} alt="" fill sizes="40px" className="object-cover" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <Link href={`/admin/productos/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "category_slug", header: "Categoría" },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `S/. ${formatPEN(row.original.price)}`,
    },
    {
      id: "active",
      header: "Activo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={row.original.active}
            onCheckedChange={(checked) =>
              toggleActive.mutate({ id: row.original.id, active: checked === true })
            }
          />
          <ActiveBadge active={row.original.active} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/admin/productos/${row.original.id}`} />}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={products} getRowId={(p) => String(p.id)} emptyMessage="Sin productos." />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="¿Eliminar producto?"
        description={`"${pendingDelete?.name}" se va a borrar de forma permanente. Si ya tiene pedidos asociados, mejor desactivalo en vez de eliminarlo.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteProduct.mutate(pendingDelete.id, {
            onSuccess: () => toast.success("Producto eliminado."),
            onError: () => toast.error("No se pudo eliminar (probablemente ya tiene pedidos asociados)."),
          });
        }}
      />
    </>
  );
}
