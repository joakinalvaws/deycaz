"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productsService from "../services/products";
import { compressImage } from "../services/imageCompression";

function imagesKey(productId: number) {
  return ["admin", "products", "images", productId] as const;
}

export function useProductImages(productId: number) {
  return useQuery({
    queryKey: imagesKey(productId),
    queryFn: () => productsService.listProductImages(productId),
  });
}

export function useUploadProductImages(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    // Subida en paralelo — cada archivo se comprime y sube de forma
    // independiente (Promise.all), sin esperar a que termine el anterior.
    mutationFn: async (files: File[]) => {
      const compressed = await Promise.all(files.map(compressImage));
      return Promise.all(compressed.map((file) => productsService.uploadProductImage(productId, file)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imagesKey(productId) }),
  });
}

export function useDeleteProductImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => productsService.deleteProductImage(imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imagesKey(productId) }),
  });
}

export function useReorderProductImages(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (images: { id: number; sort_order: number }[]) => productsService.reorderProductImages(images),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imagesKey(productId) }),
  });
}

export function useSetPrimaryImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, url }: { imageId: number; url: string }) =>
      productsService.setPrimaryImage(productId, imageId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesKey(productId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", "detail", productId] });
    },
  });
}
