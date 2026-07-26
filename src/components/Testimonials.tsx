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
          <p className="mt-3.5 text-sm leading-relaxed text-[#3a3a38]">
            Más de 300 personas en todo el Perú ya compraron con nosotros. Cada decant se envasa a mano
            desde frascos originales, se sella y se envía en 24–48 horas, con pago contra entrega para
            que solo pagues cuando tengas tu pedido en la mano.
          </p>
        </div>
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[85%] flex-none snap-start border border-border bg-white p-6 sm:w-auto"
            >
              <div className="mb-3 text-[15px] tracking-widest">{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
              <p className="mb-4 text-sm leading-relaxed text-[#3a3a38]">&ldquo;{t.text}&rdquo;</p>
              <div className="text-[13px] font-bold">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
