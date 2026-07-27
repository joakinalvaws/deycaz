"use client";

import { useState } from "react";
import Image from "next/image";
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
  // Se guarda el slug y la fila se busca en `categories` en cada render, en
  // vez de guardar una copia de la categoría: al subir la foto de fondo, la
  // query se invalida y llega una fila nueva con la `image_url` nueva — con
  // una copia en estado el diálogo se quedaba mostrando la foto vieja.
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const editing = editingSlug ? (categories.find((c) => c.slug === editingSlug) ?? null) : null;
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const columns: ColumnDef<Category>[] = [
    {
      id: "image",
      header: "Foto",
      cell: ({ row }) =>
        row.original.image_url ? (
          <div className="bg-muted relative aspect-4/3 w-14 overflow-hidden rounded">
            <Image src={row.original.image_url} alt="" fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
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
            <DropdownMenuItem onClick={() => setEditingSlug(row.original.slug)}>Editar</DropdownMenuItem>
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
        <CategoryFormDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditingSlug(null)}
          category={editing}
        />
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
