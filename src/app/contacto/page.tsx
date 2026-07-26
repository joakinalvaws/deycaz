import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contacto — DEYCAZ" };

export default function ContactoPage() {
  return (
    <section className="mx-auto grid max-w-[1000px] grid-cols-1 gap-12 px-6 py-14 md:grid-cols-2 md:px-10">
      <div>
        <h1 className="font-serif mb-4 text-[28px]">Contacto</h1>
        <p className="text-muted mb-7 text-sm leading-relaxed">
          ¿Tienes dudas sobre un perfume o tu pedido? Escríbenos y te respondemos el mismo día.
        </p>
        <div className="flex flex-col gap-2.5 text-[13px] text-[#3a3a38]">
          <div>
            <strong>WhatsApp:</strong> +51 987 654 321
          </div>
          <div>
            <strong>Instagram:</strong> @deycaz.pe
          </div>
          <div>
            <strong>TikTok:</strong> @deycaz.pe
          </div>
          <div>
            <strong>Horario:</strong> Lun–Sáb, 10am–8pm
          </div>
        </div>
      </div>
      <div>
        <ContactForm />
      </div>
    </section>
  );
}
