import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/constants";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "Contacto";
const description = "Escríbenos por WhatsApp, Instagram o el formulario. Te respondemos el mismo día.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contacto" },
  openGraph: { title, description, url: "/contacto", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
};

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
            <strong>WhatsApp:</strong>{" "}
            <a
              href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&type=phone_number&app_absent=0`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div>
            <strong>Instagram:</strong>{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-muted">
              @deycaz.pe
            </a>
          </div>
          <div>
            <strong>TikTok:</strong>{" "}
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-muted">
              @deycaz.pe
            </a>
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
