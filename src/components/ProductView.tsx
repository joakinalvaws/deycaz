"use client";

import { useMemo, useState } from "react";
import { ProductImage } from "./ProductImage";
import { ProductDetail } from "./ProductDetail";
import type { ProductImage as ProductImageData } from "@/lib/types";
import type { Size } from "@/lib/pricing";

export function ProductView({
  productId,
  name,
  categorySlug,
  basePrice,
  price3ml,
  price10ml,
  priceFullBottle,
  description,
  fallbackImageUrl,
  images,
  children,
}: {
  productId: number;
  name: string;
  categorySlug: string;
  basePrice: number;
  price3ml: number | null;
  price10ml: number | null;
  priceFullBottle: number | null;
  description: string | null;
  fallbackImageUrl: string | null;
  images: ProductImageData[];
  children?: React.ReactNode;
}) {
  const [size, setSize] = useState<Size>("5");
  // Miniatura elegida a mano por el cliente — mientras esté activa, manda
  // sobre la foto del tamaño elegido. Se limpia al cambiar de tamaño para
  // que ese tamaño vuelva a decidir cuál es la foto principal.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleSizeChange(newSize: Size) {
    setSize(newSize);
    setPreviewUrl(null);
  }

  // Foto propia del tamaño elegido si existe; si no, la principal de
  // siempre (products.image_url) — nunca queda sin imagen.
  const sizeImageUrl = images.find((img) => img.sizeTag === size)?.url;
  const mainImageUrl = previewUrl ?? sizeImageUrl ?? fallbackImageUrl;

  // Todas las fotos del producto (principal + por tamaño + galería), sin
  // duplicados, para armar la tira de miniaturas — "los demás" son todas
  // las que no sean, en este momento, la que se ve como central.
  const allImages = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    if (fallbackImageUrl) {
      seen.add(fallbackImageUrl);
      list.push(fallbackImageUrl);
    }
    for (const img of images) {
      if (!seen.has(img.url)) {
        seen.add(img.url);
        list.push(img.url);
      }
    }
    return list;
  }, [images, fallbackImageUrl]);

  const thumbnails = allImages.filter((url) => url !== mainImageUrl);

  return (
    <>
      <div className="flex gap-3">
        {thumbnails.length > 0 && (
          <div className="flex max-h-[520px] w-14 flex-none flex-col gap-2 overflow-y-auto sm:w-20">
            {thumbnails.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewUrl(url)}
                className="border-border-strong relative aspect-square w-full flex-none overflow-hidden border bg-cream"
              >
                <ProductImage src={url} alt={name} sizes="80px" />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-square min-w-0 flex-1 bg-cream">
          <ProductImage src={mainImageUrl} alt={name} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
      </div>

      <div>
        <h1 className="mb-2.5 text-[28px] font-bold">{name}</h1>
        <p className="text-muted mb-5 text-[13px] tracking-wide uppercase">{categorySlug}</p>

        <ProductDetail
          productId={productId}
          name={name}
          categorySlug={categorySlug}
          basePrice={basePrice}
          price3ml={price3ml}
          price10ml={price10ml}
          priceFullBottle={priceFullBottle}
          description={description}
          size={size}
          onSizeChange={handleSizeChange}
        />

        {children}
      </div>
    </>
  );
}
