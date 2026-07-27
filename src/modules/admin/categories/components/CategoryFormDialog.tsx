"use client";

import { useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
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
import {
  useCreateCategory,
  useRemoveCategoryImage,
  useSetCategoryImage,
  useUpdateCategory,
} from "../hooks/useCategories";
import { categorySchema, CATEGORY_FORM_DEFAULTS, type CategoryFormValues } from "../schemas/category";
import type { Category } from "../types";

/** Foto de fondo del tile de categoría (home y /catalogo). Solo aparece al
 * editar una categoría que ya existe: la subida necesita el slug para saber
 * a qué fila apuntar, y en una categoría nueva todavía no hay. */
function CategoryImageField({ category }: { category: Category }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setImage = useSetCategoryImage(category.slug);
  const removeImage = useRemoveCategoryImage(category.slug);
  const busy = setImage.isPending || removeImage.isPending;

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Foto de fondo del tile</Label>
      <div className="flex items-center gap-3">
        <div
          onClick={() => !busy && inputRef.current?.click()}
          className="bg-muted relative aspect-4/3 w-32 shrink-0 cursor-pointer overflow-hidden rounded-md border"
        >
          {category.image_url ? (
            <Image src={category.image_url} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <Upload className="size-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Subiendo…" : category.image_url ? "Reemplazar" : "Subir"}
          </Button>
          {category.image_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              className="justify-start gap-2"
              onClick={() =>
                removeImage.mutate(undefined, {
                  onSuccess: () => toast.success("Foto quitada."),
                  onError: () => toast.error("No se pudo quitar la foto."),
                })
              }
            >
              <Trash2 className="text-destructive size-4" />
              Quitar
            </Button>
          )}
          <p className="text-muted-foreground text-xs">Sin foto, el tile queda en fondo oscuro.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImage.mutate(file, {
              onSuccess: () => toast.success("Foto actualizada."),
              onError: () => toast.error("No se pudo subir la foto."),
            });
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

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
          {category && <CategoryImageField category={category} />}
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
