"use client";

import { useState } from "react";
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

  // Foto propia del tamaño elegido si existe; si no, la principal de
  // siempre (products.image_url) — nunca queda sin imagen.
  const sizeImageUrl = images.find((img) => img.sizeTag === size)?.url;
  const mainImageUrl = sizeImageUrl ?? fallbackImageUrl;

  // Fotos sueltas de la galería general (ni principal ni de un tamaño) —
  // antes se subían desde el admin pero nunca se mostraban acá.
  const gallery = images.filter((img) => !img.isPrimary && !img.sizeTag);

  return (
    <>
      <div>
        <div className="relative aspect-square w-full bg-cream">
          <ProductImage src={mainImageUrl} alt={name} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
        {gallery.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {gallery.map((img, i) => (
              <div key={i} className="relative aspect-square bg-cream">
                <ProductImage src={img.url} alt={name} sizes="120px" />
              </div>
            ))}
          </div>
        )}
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
          onSizeChange={setSize}
        />

        {children}
      </div>
    </>
  );
}
