"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products]);

  // Publica la altura real del header en una variable CSS para que las
  // páginas puedan reservar ese espacio (el header es "fixed" para poder
  // flotar transparente sobre el hero).
  useEffect(() => {
    function updateHeight() {
      if (headerRef.current) {
        document.documentElement.style.setProperty("--header-h", `${headerRef.current.offsetHeight}px`);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Arriba del todo: transparente y visible. Al bajar: se oculta apenas sale
  // de la vista. Al subir: reaparece con fondo blanco. Sin transición/
  // animación — el cambio es instantáneo (así se evita el efecto raro que
  // daba el slide animado).
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
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-100 border-b ${hidden ? "-translate-y-full" : "translate-y-0"} ${
        atTop ? "border-transparent bg-transparent" : "border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
      }`}
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
                className="mr-2 w-36 border border-border-strong bg-white px-3 py-2 text-[13px] text-foreground outline-none sm:w-56"
              />
            )}
            <button
              type="button"
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
              className="bg-transparent text-2xl text-foreground"
            >
              ⌕
            </button>

            {searchOpen && results.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 border border-border bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
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

          <button type="button" aria-label="Carrito" onClick={toggleCart} className="relative bg-transparent text-2xl text-foreground">
            ⛃
            <span className="absolute -top-2 -right-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
              {count}
            </span>
          </button>
        </div>
      </div>

      <nav className={`flex gap-6 overflow-x-auto border-t px-6 py-3 lg:hidden ${atTop ? "border-transparent" : "border-border"}`}>
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
