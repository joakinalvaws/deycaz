"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as categoriesService from "../services/categories";
import type { CategoryInput } from "../services/categories";

const CATEGORIES_KEY = ["admin", "categories", "list"] as const;

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: categoriesService.listCategories });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoriesService.createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CategoryInput>) => categoriesService.updateCategory(slug, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => categoriesService.deleteCategory(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
