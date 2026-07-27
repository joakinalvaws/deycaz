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

      <footer className="bg-foreground px-6 pt-10 pb-10 md:px-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-8 gap-y-10 border-t border-[#232321] pt-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
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
            <div className="flex flex-col gap-2.5">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-muted-2 text-[13px] hover:text-white">
                Instagram
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-muted-2 text-[13px] hover:text-white">
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* "Términos y políticas" queda como texto, no link: todavía no
            existe esa página en el sitio. */}
        <div className="mx-auto mt-10 flex max-w-[1400px] flex-col items-center gap-2 border-t border-[#232321] pt-6 text-center text-[11px] text-[#807e7a] sm:flex-row sm:justify-between">
          <span>© 2026 DEYCAZ</span>
          <span>Términos y políticas</span>
        </div>
      </footer>
    </>
  );
}
