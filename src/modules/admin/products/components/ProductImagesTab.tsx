"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDeleteProductImage,
  useProductImages,
  useReorderProductImages,
  useSetSizeTagImage,
  useUploadPrincipalImage,
  useUploadProductImages,
} from "../hooks/useProductImages";
import type { ProductImage, ProductImageSizeTag } from "../types";

const SIZE_TAG_LABEL: Record<ProductImageSizeTag, string> = {
  "3": "3ml",
  "5": "5ml",
  "10": "10ml",
  full: "Frasco entero",
};

function SingleImageSlot({
  image,
  onUpload,
  onRemove,
  isUploading,
}: {
  image?: ProductImage;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="bg-muted relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border"
      >
        {image ? (
          <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <Upload className="size-5" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {image ? "Reemplazar" : "Subir"}
        </Button>
        {image && onRemove && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
            <Trash2 className="text-destructive size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProductImagesTab({ productId }: { productId: number }) {
  const { data: images, isLoading } = useProductImages(productId);
  const uploadPrincipal = useUploadPrincipalImage(productId);
  const setSizeTagImage = useSetSizeTagImage(productId);
  const uploadGalleryImages = useUploadProductImages(productId);
  const deleteImage = useDeleteProductImage(productId);
  const reorderImages = useReorderProductImages(productId);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const principal = images?.find((img) => img.is_primary);
  const sizeImages: Partial<Record<ProductImageSizeTag, ProductImage>> = {};
  for (const img of images ?? []) {
    if (img.size_tag) sizeImages[img.size_tag] = img;
  }
  const gallery = (images ?? []).filter((img) => !img.is_primary && !img.size_tag);

  async function handleGalleryFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      await uploadGalleryImages.mutateAsync(Array.from(files));
      toast.success(`${files.length} imagen(es) subida(s).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir alguna imagen.";
      toast.error(message);
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    const reordered = [...gallery];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderImages.mutate(reordered.map((img, i) => ({ id: img.id, sort_order: i })));
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-sm font-semibold">Imagen principal</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Es la que se ve en las tarjetas de producto (catálogo, inicio, etc.).
        </p>
        <div className="max-w-[180px]">
          <SingleImageSlot
            image={principal}
            isUploading={uploadPrincipal.isPending}
            onUpload={(file) => {
              uploadPrincipal.mutate(file, {
                onSuccess: () => toast.success("Imagen principal actualizada."),
                onError: () => toast.error("No se pudo subir la imagen."),
              });
            }}
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold">Imágenes por tamaño</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Se muestran en la página del producto al elegir ese tamaño, en vez de la principal. Un tamaño
          sin foto propia sigue mostrando la principal.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["3", "5", "10", "full"] as ProductImageSizeTag[]).map((sizeTag) => (
            <div key={sizeTag} className="flex flex-col gap-2">
              <p className="text-xs font-medium">{SIZE_TAG_LABEL[sizeTag]}</p>
              <SingleImageSlot
                image={sizeImages[sizeTag]}
                isUploading={setSizeTagImage.isPending}
                onUpload={(file) => {
                  setSizeTagImage.mutate(
                    { sizeTag, file },
                    {
                      onSuccess: () => toast.success(`Imagen de ${SIZE_TAG_LABEL[sizeTag]} actualizada.`),
                      onError: () => toast.error("No se pudo subir la imagen."),
                    },
                  );
                }}
                onRemove={() => {
                  const img = sizeImages[sizeTag];
                  if (img) deleteImage.mutate(img.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold">Galería adicional</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Fotos sueltas que se muestran como miniaturas en la página del producto, además de la imagen
          principal/por tamaño.
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            handleGalleryFiles(e.dataTransfer.files);
          }}
          onClick={() => galleryInputRef.current?.click()}
          className={cn(
            "mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors",
            isDraggingOver ? "border-primary bg-primary/5" : "border-input",
          )}
        >
          <Upload className="text-muted-foreground size-6" />
          <p className="text-sm">Arrastrá imágenes acá, o hacé click para elegirlas</p>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleGalleryFiles(e.target.files)}
          />
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((img, i) => (
              <div key={img.id} className="group relative overflow-hidden rounded-md border">
                <div className="bg-muted relative aspect-square w-full">
                  <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1 border-t p-1">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={i === 0}
                    onClick={() => moveGallery(i, -1)}
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={i === gallery.length - 1}
                    onClick={() => moveGallery(i, 1)}
                  >
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button type="button" size="icon-xs" variant="ghost" onClick={() => deleteImage.mutate(img.id)}>
                    <Trash2 className="text-destructive size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
