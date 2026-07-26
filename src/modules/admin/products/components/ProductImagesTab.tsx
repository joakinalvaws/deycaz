"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDeleteProductImage,
  useProductImages,
  useReorderProductImages,
  useSetPrimaryImage,
  useUploadProductImages,
} from "../hooks/useProductImages";

export function ProductImagesTab({ productId }: { productId: number }) {
  const { data: images, isLoading } = useProductImages(productId);
  const uploadImages = useUploadProductImages(productId);
  const deleteImage = useDeleteProductImage(productId);
  const reorderImages = useReorderProductImages(productId);
  const setPrimaryImage = useSetPrimaryImage(productId);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      await uploadImages.mutateAsync(Array.from(files));
      toast.success(`${files.length} imagen(es) subida(s).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir alguna imagen.";
      toast.error(message);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!images) return;
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
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
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors",
          isDraggingOver ? "border-primary bg-primary/5" : "border-input",
        )}
      >
        <Upload className="text-muted-foreground size-6" />
        <p className="text-sm">Arrastrá imágenes acá, o hacé click para elegirlas</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="group relative overflow-hidden rounded-md border">
              <div className="bg-muted relative aspect-square w-full">
                <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              </div>
              {img.is_primary && (
                <span className="bg-primary text-primary-foreground absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Principal
                </span>
              )}
              <div className="flex items-center justify-between gap-1 border-t p-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  title="Marcar como principal"
                  onClick={() => setPrimaryImage.mutate({ imageId: img.id, url: img.url })}
                >
                  <Star className={cn("size-3.5", img.is_primary && "fill-current")} />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => deleteImage.mutate(img.id)}
                >
                  <Trash2 className="text-destructive size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
