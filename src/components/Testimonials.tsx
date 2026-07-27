"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { Testimonial } from "@/lib/types";
import testimonial1 from "@/assets/testimonial-1.webp";
import testimonial2 from "@/assets/testimonial-2.webp";
import testimonial3 from "@/assets/testimonial-3.webp";
import testimonial4 from "@/assets/testimonial-4.webp";

/** Fotos fijas por posición (no hay panel admin para testimonios, a
 * diferencia de productos/categorías — ver migración 0004). El orden viene
 * de `sort_order` en la consulta, así que el índice del array coincide con
 * el testimonio 1, 2, 3, 4 tal cual se pidieron las fotos. */
const TESTIMONIAL_IMAGES = [testimonial1, testimonial2, testimonial3, testimonial4];

function TestimonialCard({ t, img }: { t: Testimonial; img: StaticImageData | string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
      {img && (
        <>
          <Image src={img} alt={t.name} fill sizes="(min-width: 1024px) 25vw, 85vw" className="object-cover" />
          {/* Degradado solo abajo (no negro plano encima de toda la foto)
              para que la imagen se aprecie casi completa y el texto,
              pegado al fondo, siga siendo legible. */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent" />
        </>
      )}
      <div
        className={`relative flex min-h-[380px] flex-col items-center justify-end p-6 text-center ${
          img ? "text-white" : ""
        }`}
      >
        <div className="mb-3 text-[15px] tracking-widest">{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
        <p className={`mb-4 text-sm leading-relaxed ${img ? "" : "text-[#3a3a38]"}`}>&ldquo;{t.text}&rdquo;</p>
        <div className="text-[13px] font-bold">{t.name}</div>
      </div>
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 2000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const cards = testimonials.map((t, i) => ({ t, img: TESTIMONIAL_IMAGES[i] ?? t.imageUrl }));

  return (
    <section className="bg-cream px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto mb-10 max-w-[660px] text-center">
          <div className="font-display text-[56px] leading-none tracking-wide">
            <span className="text-[#166534]">+300</span> CLIENTES SATISFECHOS
          </div>
          {/* Solo en escritorio — en mobile ocupa mucho espacio para lo que aporta. */}
          <p className="mt-3.5 hidden text-sm leading-relaxed text-[#3a3a38] md:block">
            Más de 300 personas en todo el Perú ya compraron con nosotros. Cada decant se envasa a mano
            desde frascos originales, se sella y se envía en 24–48 horas, con pago contra entrega para
            que solo pagues cuando tengas tu pedido en la mano.
          </p>
        </div>

        {/* Mobile: una sola tarjeta centrada que rota sola cada 2s (antes
            era scroll horizontal con snap, donde se alcanzaba a ver el
            borde de la siguiente y quedaba una barra de scroll abajo).
            Desktop: la grilla completa, sin cambios. */}
        <div className="sm:hidden">
          <div key={cards[index].t.id} className="mx-auto w-full max-w-[380px] animate-in fade-in duration-500">
            <TestimonialCard t={cards[index].t} img={cards[index].img} />
          </div>
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {cards.map(({ t, img }) => (
            <TestimonialCard key={t.id} t={t} img={img} />
          ))}
        </div>
      </div>
    </section>
  );
}
