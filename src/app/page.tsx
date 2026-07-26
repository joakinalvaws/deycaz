import Link from "next/link";
import Image from "next/image";
import { getBestSellers, getCategories, getTestimonials } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { ProductRail } from "@/components/ProductRail";
import { Testimonials } from "@/components/Testimonials";
import { CategoryTile } from "@/components/CategoryTile";
import { Marquee } from "@/components/Marquee";
import heroMasVendido from "@/assets/hero-mas-vendido.webp";

export const revalidate = 300;

export default async function HomePage() {
  const [bestSellers, categories, testimonials] = await Promise.all([
    getBestSellers(),
    getCategories(),
    getTestimonials(),
  ]);

  return (
    <>
      {/* El texto/precio promocional va integrado en la imagen publicitaria
          (banner diseñado aparte) — por eso esta sección ya no renderiza
          título/precio, solo la imagen y el botón. En mobile el hero mide
          ~40% del alto de pantalla (con recorte de imagen vía object-cover,
          a pedido) en vez de seguir el aspect-ratio real del banner; en
          escritorio sí se respeta el aspect-ratio 1920x700 sin recortes.
          lg:-mt-24 solo en escritorio: ahí el header flota fijo encima del
          hero (ver Header.tsx) — en celular el header es sticky (no fixed),
          así que el hero va en flujo normal, sin necesitar compensación. */}
      <section className="relative h-[40vh] min-h-[260px] w-full lg:aspect-[1920/700] lg:h-auto lg:min-h-0 lg:-mt-24">
        <Image
          src={heroMasVendido}
          alt="El más vendido"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute right-6 bottom-9 md:right-10">
          <Link
            href="/combo"
            className="inline-block rounded-full bg-foreground px-10 py-4 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
          >
            Comprar ahora
          </Link>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        {bestSellers.length > 0 && (
          <ProductRail>
            {bestSellers.map((p, i) => (
              <div key={p.id} className="w-[240px] flex-none snap-start md:w-[260px]">
                <ProductCard product={p} priority={i < 3} />
              </div>
            ))}
          </ProductRail>
        )}
      </section>

      <Testimonials testimonials={testimonials} />

      <section className="px-6 pt-16 md:px-10 md:pt-24">
        <div className="relative mx-auto h-[420px] max-w-[1400px] overflow-hidden bg-foreground md:h-[520px]">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/82 via-black/55 to-black/15" />
          <div className="absolute top-1/2 left-6 max-w-[520px] -translate-y-1/2 md:left-16">
            <span className="inline-block border border-white/50 px-4 py-2 text-xs font-bold tracking-wide text-white">
              AHORRA HASTA S/. 100
            </span>
            <h2 className="font-display mt-5 text-5xl leading-[0.95] tracking-wide text-white md:text-7xl">
              ARMA TU COMBO
            </h2>
            <p className="mt-2.5 mb-5 text-lg font-semibold text-white">Descubre tu perfume favorito.</p>
            <div className="mb-7 flex flex-col gap-2.5">
              <span className="text-sm text-[#e3e2df]">— Elige entre +50 perfumes</span>
              <span className="text-sm text-[#e3e2df]">— Descuento por cada decant adicional</span>
            </div>
            <Link href="/combo" className="inline-block bg-white px-10 py-4 text-[13px] font-bold tracking-wide">
              ARMA TU COMBO
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display mb-9 text-center text-4xl tracking-wide md:text-[42px]">CATÁLOGO</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <CategoryTile
                key={c.slug}
                category={c}
                imageUrl={null}
                caption={
                  c.slug === "promos"
                    ? "PROMOCIONES"
                    : c.slug === "damas"
                      ? "DAMAS"
                      : `Perfumes ${c.name}`
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pt-16 pb-16 md:px-10 md:pt-24 md:pb-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 md:grid-cols-[340px_1fr] md:gap-12">
          <div className="aspect-9/16 w-full bg-cream" />
          <div className="flex flex-col justify-center">
            <h2 className="mb-4 text-2xl font-bold">Como en video, así de real</h2>
            <div className="mb-5 flex gap-4">
              <div className="h-14 w-14 flex-none rounded-full bg-cream" />
              <div>
                <div className="text-[15px] font-bold">@deycaz.pe</div>
                <div className="my-1 text-sm tracking-widest">★★★★★</div>
                <p className="text-muted max-w-[440px] text-sm leading-relaxed">
                  &ldquo;Pedí un decant para probar antes de comprar el frasco completo y quedé
                  fascinada. Llegó rapidísimo y bien embalado.&rdquo;
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 border-t border-border pt-6 sm:grid-cols-3">
              <div>
                <div className="text-[15px] font-extrabold">100% ORIGINALES</div>
                <div className="text-muted mt-1 text-xs">Decants verificados</div>
              </div>
              <div>
                <div className="text-[15px] font-extrabold">ENVÍO 24-48H</div>
                <div className="text-muted mt-1 text-xs">A todo el Perú</div>
              </div>
              <div>
                <div className="text-[15px] font-extrabold">PAGO CONTRA ENTREGA</div>
                <div className="text-muted mt-1 text-xs">Sin adelantos</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
