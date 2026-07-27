"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as categoriesService from "../services/categories";
import type { CategoryInput } from "../services/categories";
import { compressImage } from "@/modules/admin/products/services/imageCompression";
import { revalidateCategoryPaths } from "@/modules/admin/shared/actions/revalidate";

function revalidate(categorySlug?: string) {
  revalidateCategoryPaths(categorySlug).catch((err) =>
    console.error("No se pudo revalidar el sitio público:", err),
  );
}

const CATEGORIES_KEY = ["admin", "categories", "list"] as const;

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: categoriesService.listCategories });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoriesService.createCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      revalidate(data.slug);
    },
  });
}

export function useUpdateCategory(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CategoryInput>) => categoriesService.updateCategory(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      revalidate(slug);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => categoriesService.deleteCategory(slug),
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      revalidate(slug);
    },
  });
}

/** Sube la foto de fondo del tile. Se comprime en el navegador con el mismo
 * helper que las fotos de producto: son fotos de fondo grandes y no tiene
 * sentido subir el original de la cámara. */
export function useSetCategoryImage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => categoriesService.setCategoryImage(slug, await compressImage(file)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      revalidate(slug);
    },
  });
}

export function useRemoveCategoryImage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => categoriesService.removeCategoryImage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      revalidate(slug);
    },
  });
}
