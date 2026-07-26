import Link from "next/link";
import Image from "next/image";
import { getBestSellers, getCategories, getTestimonials } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { ProductRail } from "@/components/ProductRail";
import { Testimonials } from "@/components/Testimonials";
import { CategoryTile } from "@/components/CategoryTile";
import { Marquee } from "@/components/Marquee";
import { TikTokEmbed } from "@/components/TikTokEmbed";
import heroFrascos from "@/assets/hero-frascos.png";

export const revalidate = 300;

export default async function HomePage() {
  const [bestSellers, categories, testimonials] = await Promise.all([
    getBestSellers(),
    getCategories(),
    getTestimonials(),
  ]);

  return (
    <>
      {/* Hero recodificado (antes era una sola imagen banner con el texto
          ya "quemado" en el diseño). Ahora el texto es HTML real y la
          imagen es solo las botellas (PNG recortado sin el margen
          transparente sobrante — así se ven más grandes a un mismo ancho),
          para poder reordenar independientemente en mobile vs desktop.
          -mt-28/lg:-mt-24: el header es "fixed" siempre (ver Header.tsx) y
          flota transparente encima de este hero; en mobile el header mide
          más (2 filas) que en desktop (1 fila), de ahí el valor distinto
          (ver layout.tsx). El padding/tamaños de mobile están comprimidos
          a propósito para que el hero mobile mida ~50% del alto de
          pantalla en vez del ~85% que ocupaba antes; min-h-[50vh] es un
          piso, no un tope, para no recortar contenido si algún dispositivo
          necesita más espacio. order-1/order-2 (con su variante md:)
          invierten el orden visual entre breakpoints sin duplicar el HTML:
          en mobile la imagen queda arriba (order-1) y el texto abajo
          (order-2); en desktop el texto queda a la izquierda (md:order-1)
          y la imagen a la derecha (md:order-2), en flex-row. */}
      <section className="relative -mt-28 min-h-[50vh] w-full bg-[linear-gradient(to_bottom,#e8e6e1_0%,#ffffff_50%,#e8e6e1_100%)] px-6 pt-24 pb-8 md:px-10 md:pt-40 md:pb-24 lg:-mt-24 lg:min-h-0">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 md:flex-row md:justify-between md:gap-12">
          <div className="order-2 flex w-full flex-col items-center text-center md:order-1 md:w-1/2 md:items-start md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00c164] px-4 py-1.5 text-xs font-bold text-foreground">
              ★ MÁS VENDIDO
            </span>
            <h1 className="font-display mt-3 text-4xl leading-[0.9] tracking-wide text-foreground md:text-7xl">
              ROMPE CUELLOS
            </h1>
            <p className="mt-2 text-xs font-semibold text-muted md:text-base">
              Erba Pura | Valentino | Stronger With You
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl font-extrabold text-foreground md:text-6xl">
                S/.89<span className="text-xl">.00</span>
              </span>
              <span className="inline-block rounded-md bg-foreground px-3 py-1.5 text-xs font-bold text-white">-34%</span>
            </div>
            <div className="mt-1 text-sm text-muted line-through md:text-lg">S/.135.00</div>
            <Link
              href="/combo"
              className="mt-4 inline-block rounded-full bg-foreground px-10 py-3.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.22)] md:mt-8 md:py-4"
            >
              Comprar ahora
            </Link>
          </div>

          <div className="order-1 w-full md:order-2 md:w-1/2">
            <Image
              src={heroFrascos}
              alt="Perfumes decantados: Erba Pura, Valentino y Stronger With You"
              priority
              className="mx-auto h-auto w-[280px] sm:w-[320px] md:mr-0 md:w-[420px] lg:w-[500px]"
            />
          </div>
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
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
            {categories.map((c) => (
              <div key={c.slug} className="w-[42%] flex-none snap-start sm:w-auto">
                <CategoryTile
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 pt-16 pb-16 md:px-10 md:pt-24 md:pb-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-center md:justify-center md:gap-12">
          <div className="flex justify-center md:w-[340px] md:flex-none">
            <TikTokEmbed
              url="https://www.tiktok.com/@deycaz.pe/video/7662928335361625365"
              videoId="7662928335361625365"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="mb-5 text-3xl leading-tight font-bold md:text-4xl lg:text-[40px]">
              Como en video, así de real
            </h2>
            <p className="text-muted mb-4 max-w-[520px] text-sm leading-relaxed md:text-base">
              En nuestro TikTok mostramos cada pedido tal cual sale de nuestras manos: perfumes
              decantados desde el frasco original, sellados y listos para viajar a cualquier
              rincón del Perú.
            </p>
            <p className="text-muted mb-4 max-w-[520px] text-sm leading-relaxed md:text-base">
              Nada de fotos de catálogo — así se ve y se envía un DEYCAZ real: perfume 100%
              original, decantado directo del mismo frasco que vas a recibir tú.
            </p>
            <p className="text-muted max-w-[520px] text-sm leading-relaxed md:text-base">
              Síguenos en @deycaz.pe para ver las próximas novedades antes que nadie.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
