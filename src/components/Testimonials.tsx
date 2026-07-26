import Image from "next/image";
import type { Testimonial } from "@/lib/types";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-cream px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto mb-10 max-w-[660px] text-center">
          <div className="font-display text-[56px] leading-none tracking-wide">
            +300 CLIENTES SATISFECHOS
          </div>
          {/* Solo en escritorio — en mobile ocupa mucho espacio para lo que aporta. */}
          <p className="mt-3.5 hidden text-sm leading-relaxed text-[#3a3a38] md:block">
            Más de 300 personas en todo el Perú ya compraron con nosotros. Cada decant se envasa a mano
            desde frascos originales, se sella y se envía en 24–48 horas, con pago contra entrega para
            que solo pagues cuando tengas tu pedido en la mano.
          </p>
        </div>
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative w-[85%] flex-none snap-start overflow-hidden border border-border bg-white sm:w-auto"
            >
              {t.imageUrl && (
                <>
                  <Image src={t.imageUrl} alt={t.name} fill sizes="(min-width: 1024px) 25vw, 85vw" className="object-cover" />
                  <div className="absolute inset-0 bg-black/55" />
                </>
              )}
              <div
                className={`relative flex min-h-[220px] flex-col items-center justify-center p-6 text-center ${
                  t.imageUrl ? "text-white" : ""
                }`}
              >
                <div className="mb-3 text-[15px] tracking-widest">{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
                <p className={`mb-4 text-sm leading-relaxed ${t.imageUrl ? "" : "text-[#3a3a38]"}`}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="text-[13px] font-bold">{t.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
