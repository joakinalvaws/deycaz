"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/modules/admin/shared/components/DataTable";
import { ConfirmDialog } from "@/modules/admin/shared/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPEN } from "@/lib/pricing";
import { useDeleteCategory } from "../hooks/useCategories";
import { CategoryFormDialog } from "./CategoryFormDialog";
import type { Category } from "../types";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "subtitle", header: "Subtítulo" },
    {
      accessorKey: "desde",
      header: "Desde",
      cell: ({ row }) => (row.original.desde != null ? `S/. ${formatPEN(row.original.desde)}` : "—"),
    },
    { accessorKey: "sort_order", header: "Orden" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={row.original.slug === "promos"}
              onClick={() => setPendingDelete(row.original)}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={categories} getRowId={(c) => c.slug} emptyMessage="Sin categorías." />

      {editing && (
        <CategoryFormDialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)} category={editing} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="¿Eliminar categoría?"
        description={`"${pendingDelete?.name}" se va a borrar. Los productos que la usen quedarán con una categoría inválida.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCategory.mutate(pendingDelete.slug, {
            onSuccess: () => toast.success("Categoría eliminada."),
            onError: () => toast.error("No se pudo eliminar la categoría."),
          });
        }}
      />
    </>
  );
}
