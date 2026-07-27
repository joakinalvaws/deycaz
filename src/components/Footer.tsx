import Link from "next/link";
import { INSTAGRAM_URL, TIKTOK_URL } from "@/lib/constants";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/promociones", label: "Promociones" },
  { href: "/combo", label: "Arma tu Combo" },
  { href: "/contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <>
      <section className="bg-foreground px-6 py-15 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-10">
          <div className="max-w-[420px]">
            <h3 className="mb-2.5 text-xl font-bold text-white">Mantente al día con ofertas exclusivas</h3>
            <p className="text-[13px] leading-relaxed text-muted-2">
              Obtén acceso exclusivo a ventas relámpago, nuevos productos y códigos de descuento especiales.
              ¡Regístrate ahora!
            </p>
          </div>
          <form className="flex flex-wrap gap-2.5">
            <input
              placeholder="Nombre Completo"
              className="border border-[#333331] bg-[#181816] px-4 py-3.5 text-[13px] text-white outline-none"
            />
            <input
              placeholder="Email"
              className="border border-[#333331] bg-[#181816] px-4 py-3.5 text-[13px] text-white outline-none"
            />
            <button type="submit" className="bg-white px-6 py-3.5 text-[13px] font-bold text-foreground">
              Regístrate
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-foreground px-6 pt-6 pb-6 md:px-10 md:pt-10 md:pb-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-8 gap-y-6 border-t border-[#232321] pt-6 md:grid-cols-[1.3fr_1fr_1fr] md:gap-y-10 md:pt-10">
          {/* Se oculta en mobile (ocupaba espacio y alargaba el footer sin
              aportar nada que no esté ya en el header) — en desktop se
              mantiene igual que antes. */}
          <div className="hidden md:col-span-1 md:block">
            <div className="font-serif mb-3 text-2xl font-bold tracking-[3px] text-white">DEYCAZ</div>
            <p className="text-[13px] leading-relaxed text-[#807e7a]">
              Productos de calidad para la vida moderna.
              <br />
              Descubre el aroma que te define.
            </p>
          </div>
          <div>
            {/* Desktop: siempre visible, como antes. Mobile: desplegable
                cerrado (mismo criterio que el drawer de Header.tsx — dos
                bloques JSX separados en vez de un único bloque con lógica
                condicional de apertura por breakpoint). */}
            <div className="hidden md:block">
              <div className="mb-4 text-sm font-bold text-white">Categorías</div>
              <div className="flex flex-col gap-2.5">
                {FOOTER_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="text-muted-2 text-[13px]">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="md:hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger>
                  <span className="text-sm font-bold text-white">Categorías</span>
                </CollapsibleTrigger>
                <CollapsiblePanel className="flex flex-col gap-2.5 pt-4">
                  {FOOTER_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="text-muted-2 text-[13px]">
                      {l.label}
                    </Link>
                  ))}
                </CollapsiblePanel>
              </Collapsible>
            </div>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold text-white">Síguenos</div>
            <div className="flex items-center gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-2 hover:text-white"
              >
                <svg fill="currentColor" viewBox="0 0 448 512" className="size-5" aria-hidden="true">
                  <path d="M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-muted-2 hover:text-white"
              >
                <svg fill="currentColor" viewBox="0 0 448 512" className="size-5" aria-hidden="true">
                  <path d="M448.5 209.9c-44 .1-87-13.6-122.8-39.2l0 178.7c0 33.1-10.1 65.4-29 92.6s-45.6 48-76.6 59.6-64.8 13.5-96.9 5.3-60.9-25.9-82.7-50.8-35.3-56-39-88.9 2.9-66.1 18.6-95.2 40-52.7 69.6-67.7 62.9-20.5 95.7-16l0 89.9c-15-4.7-31.1-4.6-46 .4s-27.9 14.6-37 27.3-14 28.1-13.9 43.9 5.2 31 14.5 43.7 22.4 22.1 37.4 26.9 31.1 4.8 46-.1 28-14.4 37.2-27.1 14.2-28.1 14.2-43.8l0-349.4 88 0c-.1 7.4 .6 14.9 1.9 22.2 3.1 16.3 9.4 31.9 18.7 45.7s21.3 25.6 35.2 34.6c19.9 13.1 43.2 20.1 67 20.1l0 87.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* "Términos y políticas" queda como texto, no link: todavía no
            existe esa página en el sitio. */}
        <div className="mx-auto mt-6 flex max-w-[1400px] flex-col items-center gap-2 border-t border-[#232321] pt-6 text-center text-[11px] text-[#807e7a] sm:flex-row sm:justify-between md:mt-10">
          <span>© 2026 DEYCAZ</span>
          <span>Términos y políticas</span>
        </div>
      </footer>
    </>
  );
}
