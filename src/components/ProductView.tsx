"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { ProductDetail } from "./ProductDetail";
import type { ProductAddon, ProductImage as ProductImageData } from "@/lib/types";
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
  addons,
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
  addons: ProductAddon[];
  children?: React.ReactNode;
}) {
  const [size, setSize] = useState<Size>("5");

  // Todas las fotos del producto (principal + por tamaño + galería), sin
  // duplicados — array único que arma tanto la foto activa como la tira de
  // miniaturas.
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

  // Arranca en la foto propia de 5ml (tamaño por defecto) si existe, si no
  // en la primera — nunca queda sin imagen mientras allImages no esté vacío.
  const [activeIndex, setActiveIndex] = useState(() => {
    const sizeUrl = images.find((img) => img.sizeTag === "5")?.url;
    const idx = sizeUrl ? allImages.indexOf(sizeUrl) : -1;
    return idx !== -1 ? idx : 0;
  });

  const mainImageUrl = allImages[activeIndex] ?? fallbackImageUrl ?? null;

  function handleSizeChange(newSize: Size) {
    setSize(newSize);
    // Si el tamaño elegido tiene foto propia, la foto activa salta ahí; si
    // no, se queda como está (antes: sin foto propia, mainImageUrl caía
    // solo al fallback — acá el fallback ya vive dentro de allImages, así
    // que no cambiar el índice logra el mismo resultado).
    const sizeUrl = images.find((img) => img.sizeTag === newSize)?.url;
    if (!sizeUrl) return;
    const idx = allImages.indexOf(sizeUrl);
    if (idx !== -1) setActiveIndex(idx);
  }

  function goToPrev() {
    setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
  }
  function goToNext() {
    setActiveIndex((i) => (i + 1) % allImages.length);
  }

  return (
    <>
      {/* Mobile: card cuadrado como antes (no a pantalla completa — pedido
          explícito del usuario, se veía mejor así). Desktop: imagen a la
          altura del viewport (del nav al piso de la pantalla) — las
          miniaturas quedan siempre debajo, fuera de vista hasta hacer
          scroll. 8.5rem = el mismo padding de header que ya reserva <main>
          (lg:pt-24 en src/app/(site)/layout.tsx, 6rem) + el py-10 (2.5rem)
          propio de la sección del PDP. El breakpoint es lg (no md, que es
          donde esta página arma sus 2 columnas) porque el header recién
          baja a 1 fila en lg — usar md aplicaría el offset de escritorio
          una franja de ancho antes de tiempo, con el header todavía en su
          modo mobile de 2 filas. `object-cover` (no "contain"): se pidió
          que la foto cubra todo el card sin dejar espacio arriba/abajo. */}
      <div className="flex flex-col">
        <div className="relative aspect-square w-full bg-cream lg:aspect-auto lg:h-[calc(100dvh-8.5rem)]">
          <ProductImage
            src={mainImageUrl}
            alt={name}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={goToPrev}
                className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground backdrop-blur-sm transition-colors duration-150 hover:bg-white/90 md:h-12 md:w-12"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={goToNext}
                className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground backdrop-blur-sm transition-colors duration-150 hover:bg-white/90 md:h-12 md:w-12"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="mt-3 flex w-full flex-row gap-2 overflow-x-auto">
            {allImages.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-square w-16 flex-none overflow-hidden border-2 bg-cream md:w-20 ${
                  i === activeIndex ? "border-foreground" : "border-border-strong"
                }`}
              >
                <ProductImage src={url} alt={name} sizes="80px" />
              </button>
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
          onSizeChange={handleSizeChange}
          addons={addons}
        />

        {children}
      </div>
    </>
  );
}
