import type { NextConfig } from "next";

// El optimizador de imágenes acepta cualquier URL que matchee estos
// patrones, la pida quien la pida. Con un comodín `*.supabase.co` bastaba
// con un `<img src="/_next/image?url=https://otro-proyecto.supabase.co/...">`
// para hacerle procesar imágenes ajenas a nuestro costo, así que se pinea
// el host del proyecto real (el mismo de NEXT_PUBLIC_SUPABASE_URL).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

// Headers mínimos, sin CSP: una CSP acá rompería el embed de TikTok y los
// bloques `dangerouslySetInnerHTML` de JSON-LD, y mantenerla sería trabajo
// permanente. Estos cuatro no tienen contra y cubren lo que de verdad
// aplica a una tienda sin login público. HSTS ya lo pone Vercel.
const securityHeaders = [
  // Sin esto, un archivo subido al bucket público con content-type raro
  // puede ser interpretado por el navegador como HTML/JS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nadie debería poder meter el sitio (ni /admin) dentro de un iframe.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // No filtrar la URL completa (ej. /producto/14) a dominios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La tienda no usa ninguna de estas APIs.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          // Fotos subidas a Supabase Storage (productos, testimonios, etc.).
          { protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" },
        ]
      : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El panel no se indexa (el layout ya manda el meta robots) y tampoco
      // debe quedar cacheado en un proxy compartido.
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
