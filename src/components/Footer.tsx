import Link from "next/link";

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
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 border-t border-[#232321] pt-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="font-serif mb-3 text-2xl font-bold tracking-[3px] text-white">DEYCAZ</div>
            <p className="text-[13px] leading-relaxed text-[#807e7a]">
              Productos de calidad para la vida moderna.
              <br />
              Descubre el aroma que te define.
            </p>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold text-white">Categorías</div>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-muted-2 text-[13px]">Inicio</Link>
              <Link href="/catalogo" className="text-muted-2 text-[13px]">Catálogo</Link>
              <Link href="/promociones" className="text-muted-2 text-[13px]">Promociones</Link>
              <Link href="/combo" className="text-muted-2 text-[13px]">Arma tu Combo</Link>
              <Link href="/contacto" className="text-muted-2 text-[13px]">Contacto</Link>
            </div>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold text-white">Síguenos</div>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-muted-2 text-[13px]">Instagram</a>
              <a href="#" className="text-muted-2 text-[13px]">TikTok</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
