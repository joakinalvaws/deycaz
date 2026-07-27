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
import comboBackground from "@/assets/combo-background.webp";
import comboBackgroundMobile from "@/assets/combo-background-mobile.webp";

export const revalidate = 300;

/** Ícono de los bullets de "Arma tu Combo" (antes un simple "—"). Viene del
 * SVG que se dejó en la raíz del proyecto (secure-svgrepo-com.svg);
 * fill="currentColor" en vez del "#000000" original para que herede el
 * color de texto del bullet. */
function ComboBulletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4472 1.10557C12.1657 0.964809 11.8343 0.964809 11.5528 1.10557L3.55279 5.10557C3.214 5.27496 3 5.62123 3 6V12C3 14.6622 3.86054 16.8913 5.40294 18.7161C6.92926 20.5218 9.08471 21.8878 11.6214 22.9255C11.864 23.0248 12.136 23.0248 12.3786 22.9255C14.9153 21.8878 17.0707 20.5218 18.5971 18.7161C20.1395 16.8913 21 14.6622 21 12V6C21 5.62123 20.786 5.27496 20.4472 5.10557L12.4472 1.10557ZM5 12V6.61803L12 3.11803L19 6.61803V12C19 14.1925 18.305 15.9635 17.0696 17.425C15.8861 18.8252 14.1721 19.9803 12 20.9156C9.82786 19.9803 8.11391 18.8252 6.93039 17.425C5.69502 15.9635 5 14.1925 5 12ZM16.7572 9.65323C17.1179 9.23507 17.0714 8.60361 16.6532 8.24284C16.2351 7.88207 15.6036 7.9286 15.2428 8.34677L10.7627 13.5396L8.70022 11.5168C8.30592 11.1301 7.67279 11.1362 7.28607 11.5305C6.89935 11.9248 6.90549 12.5579 7.29978 12.9446L10.1233 15.7139C10.3206 15.9074 10.5891 16.0106 10.8651 15.9991C11.1412 15.9876 11.4002 15.8624 11.5807 15.6532L16.7572 9.65323Z"
      />
    </svg>
  );
}

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
      {/* Corrección sobre el primer intento (que bajó el centro de #ffffff a
          un off-white): el centro se quería blanco puro tal cual. Lo que se
          pidió es otra cosa — bordes un poco más oscuros (#e8e6e1 → #d8d6d1)
          y que ese beige "coma" más espacio antes de llegar al blanco: se
          agrega una meseta de 0-15%/85-100% en vez de que la transición
          arranque desde el borde mismo, así el blanco puro queda más
          concentrado en el centro. */}
      <section className="relative -mt-28 min-h-[50vh] w-full bg-[linear-gradient(to_bottom,#d8d6d1_0%,#d8d6d1_15%,#ffffff_50%,#d8d6d1_85%,#d8d6d1_100%)] px-6 pt-24 pb-6 md:px-10 md:pt-40 md:pb-10 lg:-mt-24 lg:min-h-0">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 md:flex-row md:justify-center md:gap-10 lg:gap-14">
          <div className="order-2 flex w-full flex-col items-center text-center md:order-1 md:w-auto md:items-start md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00c164] px-3 py-1 text-[10px] font-bold text-foreground md:gap-2 md:px-4 md:py-1.5 md:text-xs">
              ★ MÁS VENDIDO
            </span>
            <h1 className="font-display mt-3 text-8xl leading-[0.9] font-extrabold tracking-wide">
              <span className="block text-[#6b6b6b]">ROMPE</span>
              <span className="block text-foreground">CUELLOS</span>
            </h1>
            <p className="mt-2 text-xs font-semibold text-muted md:text-base">
              Erba Pura | Valentino | Stronger With You
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl font-extrabold text-foreground md:text-7xl">
                S/.89<span className="text-xl md:text-3xl">.00</span>
              </span>
              <span className="inline-block rounded-md bg-foreground px-3 py-1.5 text-xs font-bold text-white md:px-4 md:py-2 md:text-sm">
                -34%
              </span>
            </div>
            <div className="mt-1 text-sm text-muted line-through md:text-xl">S/.135.00</div>
            <Link
              href="/combo"
              className="mt-4 inline-block rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.22)] md:mt-8 md:px-10 md:py-4"
            >
              Comprar ahora
            </Link>
          </div>

          <div className="order-1 w-full md:order-2 md:w-auto">
            <Image
              src={heroFrascos}
              alt="Perfumes decantados: Erba Pura, Valentino y Stronger With You"
              priority
              className="mx-auto h-auto w-[280px] sm:w-[320px] md:w-[480px] lg:w-[560px]"
            />
          </div>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto max-w-[1400px] px-6 pt-8 pb-16 md:px-10 md:pt-12 md:pb-24">
        {bestSellers.length > 0 && (
          <ProductRail>
            {bestSellers.map((p, i) => (
              <div key={p.id} className="w-[43%] flex-none snap-start sm:w-[240px] md:w-[260px]">
                <ProductCard product={p} priority={i < 3} />
              </div>
            ))}
          </ProductRail>
        )}
      </section>

      <Testimonials testimonials={testimonials} />

      <section className="px-6 pt-16 md:px-10 md:pt-24">
        {/* -mx-6 (cancelado en md con mx-auto) para que en mobile la foto
            llegue de borde a borde de la pantalla, ignorando el padding de
            la sección — en desktop vuelve a estar centrada con max-width. */}
        <div className="relative -mx-6 h-[500px] overflow-hidden bg-foreground md:mx-auto md:h-[520px] md:max-w-[1400px]">
          <Image
            src={comboBackgroundMobile}
            alt=""
            fill
            sizes="100vw"
            className="object-cover md:hidden"
          />
          <Image
            src={comboBackground}
            alt=""
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
          />
          {/* Degradado mobile: oscuro abajo, se disipa subiendo (el texto
              va centrado en todo el alto, no anclado abajo, pero el
              contraste más fuerte cerca de la base es lo que se pidió). */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.15)_75%,rgba(0,0,0,0.15)_100%)] md:hidden" />
          {/* Degradado desktop: oscuro a la izquierda hasta ~la mitad (no
              toda la imagen), texto anclado a la izquierda como antes.
              Stops explícitos (no from/via/to de Tailwind, que reparten el
              100% del ancho) para que el negro se disipe justo pasado el
              centro. */}
          <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_35%,rgba(0,0,0,0)_58%,rgba(0,0,0,0)_100%)] md:block" />

          {/* Mobile: contenido centrado (ambos ejes). */}
          <div className="relative flex h-full items-center justify-center px-6 md:hidden">
            <div className="max-w-[420px] text-center">
              <span className="inline-block border border-white/50 px-4 py-2 text-xs font-bold tracking-wide text-white">
                AHORRA HASTA S/. 50
              </span>
              <h2 className="font-display mt-5 text-5xl leading-[0.95] tracking-wide text-white">
                ARMA TU <span className="text-amber-400">COMBO</span>
              </h2>
              <p className="mt-2.5 mb-5 text-lg font-semibold text-white">Descubre tu perfume favorito.</p>
              <div className="mb-7 flex flex-col items-center gap-2.5">
                <span className="flex items-center gap-2 text-sm font-bold text-[#e3e2df]">
                  <ComboBulletIcon /> Elige entre +50 perfumes
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-[#e3e2df]">
                  <ComboBulletIcon /> Descuento por cada decant adicional
                </span>
              </div>
              <Link
                href="/combo"
                className="inline-block rounded-full bg-[linear-gradient(to_bottom,#6b6b6b_0%,#111111_100%)] px-10 py-4 text-[13px] font-bold tracking-wide text-white"
              >
                ARMA TU COMBO
              </Link>
            </div>
          </div>

          {/* Desktop: contenido anclado a la izquierda, como antes. */}
          <div className="absolute top-1/2 left-16 hidden max-w-[520px] -translate-y-1/2 md:block">
            <span className="inline-block border border-white/50 px-4 py-2 text-xs font-bold tracking-wide text-white">
              AHORRA HASTA S/. 50
            </span>
            <h2 className="font-display mt-5 text-7xl leading-[0.95] tracking-wide text-white">
              ARMA TU <span className="text-amber-400">COMBO</span>
            </h2>
            <p className="mt-2.5 mb-5 text-lg font-semibold text-white">Descubre tu perfume favorito.</p>
            <div className="mb-7 flex flex-col gap-2.5">
              <span className="flex items-center gap-2 text-sm font-bold text-[#e3e2df]">
                <ComboBulletIcon /> Elige entre +50 perfumes
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-[#e3e2df]">
                <ComboBulletIcon /> Descuento por cada decant adicional
              </span>
            </div>
            <Link
              href="/combo"
              className="inline-block rounded-full bg-[linear-gradient(to_bottom,#6b6b6b_0%,#111111_100%)] px-10 py-4 text-[13px] font-bold tracking-wide text-white"
            >
              ARMA TU COMBO
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display mb-9 text-center text-4xl tracking-wide md:text-[42px]">CATÁLOGO</h2>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
            {categories.map((c) => (
              <div key={c.slug} className="w-[42%] flex-none snap-start sm:w-auto">
                <CategoryTile
                  category={c}
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
