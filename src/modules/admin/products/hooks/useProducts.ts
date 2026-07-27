"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productsService from "../services/products";
import type { ProductFilters, ProductInput } from "../services/products";
import type { Product } from "../types";
import { revalidateProductPaths } from "@/modules/admin/shared/actions/revalidate";

const PRODUCTS_LIST_KEY = ["admin", "products", "list"] as const;

// No se espera esta llamada (no debe frenar el flujo de guardado) pero
// tampoco se ignora en silencio — si el Server Action de revalidación
// falla, queda un rastro en la consola en vez de una promesa rota sin
// manejar.
function revalidate(productId?: number, categorySlug?: string | null) {
  revalidateProductPaths(productId, categorySlug).catch((err) =>
    console.error("No se pudo revalidar el sitio público:", err),
  );
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [...PRODUCTS_LIST_KEY, filters],
    queryFn: () => productsService.listProducts(filters),
  });
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: ["admin", "products", "detail", id],
    queryFn: () => productsService.getProduct(id as number),
    enabled: id != null,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productsService.createProduct(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
      revalidate(data.id, data.category_slug);
    },
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => productsService.updateProduct(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
      queryClient.setQueryData(["admin", "products", "detail", id], data);
      revalidate(id, data.category_slug);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
      revalidate(id);
    },
  });
}

/** Toggle optimista: la UI cambia al toque, sin esperar la respuesta del
 * servidor — si la mutación falla, se revierte solo. */
export function useToggleProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      productsService.updateProduct(id, { active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_LIST_KEY });
      const previous = queryClient.getQueriesData<Product[]>({ queryKey: PRODUCTS_LIST_KEY });
      queryClient.setQueriesData<Product[]>({ queryKey: PRODUCTS_LIST_KEY }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, active } : p)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_KEY });
      revalidate(id, data?.category_slug);
    },
  });
}
