import { Playfair_Display, Bebas_Neue, Inter } from "next/font/google";

// Playfair Display e Inter son fuentes variables y acá se piden sin
// `weight` a propósito.
//
// Ojo con la razón, porque la intuitiva es falsa: sacar `weight` NO ahorra
// descarga. Se midieron los dos builds y bajan exactamente los mismos
// 322,788 bytes de woff2 (95,488 precargados), porque Google sirve el
// archivo variable en ambos casos — `weight` solo cambia las reglas CSS que
// apuntan a él. Lo que sí cambia: pasa de 43 reglas @font-face (una por
// peso × subset de unicode) a 11, y el navegador deja de recortar los pesos
// al más cercano declarado, así que cualquier `font-*` de Tailwind dentro
// del rango 100–900 renderiza de verdad.
//
// Bebas Neue no es variable (solo existe en 400), ahí el `weight` va sí o sí.
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
