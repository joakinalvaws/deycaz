import { Playfair_Display, Bebas_Neue, Inter } from "next/font/google";

// Playfair Display e Inter son fuentes variables: al pasarles `weight` se
// descarga un archivo estático por peso (Inter pedía 5, Playfair 2). Sin
// `weight` se descarga el archivo variable, uno solo, que cubre todo el
// rango — incluidos los pesos intermedios que Tailwind pueda pedir.
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
