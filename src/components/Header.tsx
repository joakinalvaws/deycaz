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
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products]);

  // El efecto "transparente flotando sobre el hero" solo aplica en
  // escritorio (ver clases lg: abajo) — en celular el hero (banner real,
  // ancho x alto ~2.7:1) mide menos que el propio header de 2 filas, así
  // que superponerlos ahí tapaba el botón. En celular el header es
  // "sticky" normal, siempre con fondo blanco, sin necesitar compensar
  // espacio en ningún lado.
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

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/catalogo") return pathname === "/catalogo" || pathname.startsWith("/categoria");
    return pathname.startsWith(href);
  }

  return (
    <header
      className={`sticky top-0 z-100 border-b border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] lg:fixed lg:inset-x-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${atTop ? "lg:border-transparent lg:bg-transparent lg:shadow-none" : ""}`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="font-serif text-2xl font-bold tracking-[3px] text-foreground">
          DEYCAZ
        </Link>

        <nav className="hidden gap-8 lg:flex">
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

        <div className="flex items-center gap-4">
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
            ⛃
            <span className="absolute top-0 right-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
              {count}
            </span>
          </button>
        </div>
      </div>

      <nav className="flex gap-6 overflow-x-auto border-t border-border px-6 py-3 lg:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs font-semibold whitespace-nowrap ${isActive(item.href) ? "text-foreground" : "text-muted"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
