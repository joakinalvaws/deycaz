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
      {/* Mismo patrón order-1/order-2 + md:order-* que el hero de home
          (src/app/(site)/page.tsx): un solo JSX, se invierte el orden
          visual por breakpoint. Mobile: imagen arriba, miniaturas abajo en
          fila con scroll horizontal. Desktop (md:, mismo breakpoint que ya
          usa el grid de esta página en producto/[id]/page.tsx): miniaturas
          en columna a la izquierda, como antes. */}
      <div className="flex flex-col gap-3 md:flex-row">
        {thumbnails.length > 0 && (
          <div className="order-2 flex w-full flex-row gap-2 overflow-x-auto md:order-1 md:max-h-[520px] md:w-20 md:flex-none md:flex-col md:overflow-x-visible md:overflow-y-auto">
            {thumbnails.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewUrl(url)}
                className="border-border-strong relative aspect-square w-16 flex-none overflow-hidden border bg-cream md:w-full"
              >
                <ProductImage src={url} alt={name} sizes="80px" />
              </button>
            ))}
          </div>
        )}
        <div className="relative order-1 aspect-square min-w-0 bg-cream md:order-2 md:flex-1">
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
