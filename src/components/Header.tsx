"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { formatPEN } from "@/lib/pricing";

const NAV = [
  { href: "/", label: "INICIO" },
  { href: "/catalogo", label: "CATÁLOGO" },
  { href: "/promociones", label: "PROMOCIONES" },
  { href: "/combo", label: "ARMA TU COMBO" },
  { href: "/contacto", label: "CONTACTO" },
];

export function Header({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, toggleCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products]);

  // Arriba del todo: transparente y visible (se mezcla con el hero, que en
  // todos los tamaños mide más que el propio header de una sola fila). Al
  // bajar: se oculta apenas sale de la vista. Al subir: reaparece con fondo
  // blanco. Sin transición/animación — el cambio es instantáneo.
  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const nowAtTop = y < 8;
      setAtTop(nowAtTop);
      if (nowAtTop) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true); // bajando
      } else if (y < lastY) {
        setHidden(false); // subiendo
      }
      lastY = y;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú mobile al cambiar de página — ajustado durante el
  // render (no en un efecto) para no encadenar un setState síncrono.
  const [menuClosedFor, setMenuClosedFor] = useState(pathname);
  if (pathname !== menuClosedFor) {
    setMenuClosedFor(pathname);
    setMenuOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/catalogo") return pathname === "/catalogo" || pathname.startsWith("/categoria");
    return pathname.startsWith(href);
  }

  const SearchAndCart = (
    <>
      <div className="relative flex items-center">
        {searchOpen && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar perfume..."
            className="mr-2 w-24 border border-border-strong bg-white px-3 py-2 text-[13px] text-foreground outline-none sm:w-56"
          />
        )}
        <button
          type="button"
          aria-label="Buscar"
          onClick={() => setSearchOpen((v) => !v)}
          className="-m-2 bg-transparent p-2 text-2xl text-foreground"
        >
          ⌕
        </button>

        {searchOpen && results.length > 0 && (
          <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] border border-border bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:w-72">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  router.push(`/producto/${r.id}`);
                }}
                className="flex w-full justify-between border-t border-[#f0efec] bg-transparent px-1.5 py-2.5 text-left text-[13px] first:border-t-0"
              >
                <span>{r.name}</span>
                <span className="text-muted">S/. {formatPEN(r.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" aria-label="Carrito" onClick={toggleCart} className="relative -m-2 bg-transparent p-2 text-2xl text-foreground">
        🛒
        <span className="absolute top-0 right-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
          {count}
        </span>
      </button>
    </>
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-100 border-b border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${atTop ? "border-transparent bg-transparent shadow-none" : ""}`}
      >
        {/* Fila mobile: hamburguesa / logo centrado / buscar+carrito */}
        <div className="grid grid-cols-3 items-center px-6 py-4 lg:hidden">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
            className="-m-2 justify-self-start bg-transparent p-2 text-2xl text-foreground"
          >
            ☰
          </button>
          <Link href="/" className="font-serif justify-self-center text-xl font-bold tracking-[3px] text-foreground">
            DEYCAZ
          </Link>
          <div className="flex items-center gap-4 justify-self-end">{SearchAndCart}</div>
        </div>

        {/* Fila desktop: logo / nav / buscar+carrito */}
        <div className="mx-auto hidden max-w-[1400px] items-center justify-between gap-6 px-10 py-4 lg:flex">
          <Link href="/" className="font-serif text-2xl font-bold tracking-[3px] text-foreground">
            DEYCAZ
          </Link>

          <nav className="flex gap-8">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[13px] font-semibold tracking-wide ${
                    active ? "border-b-2 border-foreground pb-1 text-foreground" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">{SearchAndCart}</div>
        </div>
      </header>

      {/* Menú mobile: se abre desde la hamburguesa */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} className="fixed inset-0 z-160 bg-black/40 lg:hidden" />
          <div className="fixed inset-y-0 left-0 z-161 flex w-72 max-w-[80vw] flex-col bg-white shadow-[10px_0_40px_rgba(0,0,0,0.15)] lg:hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="font-serif text-lg font-bold tracking-[3px]">DEYCAZ</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="-m-2 bg-transparent p-2 text-lg">
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-2 py-4">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 text-sm font-semibold tracking-wide ${
                      active ? "bg-cream text-foreground" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
