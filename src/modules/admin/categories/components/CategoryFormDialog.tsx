"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";
import { categorySchema, CATEGORY_FORM_DEFAULTS, type CategoryFormValues } from "../schemas/category";
import type { Category } from "../types";

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(category?.slug ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: category
      ? {
          slug: category.slug,
          name: category.name,
          subtitle: category.subtitle,
          desde: category.desde,
          sort_order: category.sort_order,
        }
      : CATEGORY_FORM_DEFAULTS,
  });

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (category) {
        await updateCategory.mutateAsync(values);
        toast.success("Categoría actualizada.");
      } else {
        await createCategory.mutateAsync(values);
        toast.success("Categoría creada.");
      }
      onOpenChange(false);
    } catch {
      toast.error("No se pudo guardar la categoría.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" disabled={!!category} {...register("slug")} />
            {errors.slug && <p className="text-destructive text-sm">{errors.slug.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subtitle">Subtítulo (Arma tu Combo)</Label>
            <Input id="subtitle" {...register("subtitle")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desde">Precio &quot;Desde S/.&quot;</Label>
            <Input id="desde" type="number" step="0.01" {...register("desde", { valueAsNumber: true })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort_order">Orden</Label>
            <Input id="sort_order" type="number" {...register("sort_order", { valueAsNumber: true })} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
