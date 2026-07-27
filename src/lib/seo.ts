import heroMasVendido from "@/assets/hero-mas-vendido.webp";

export const SITE_URL = "https://deycaz.store";
export const SITE_NAME = "DEYCAZ";

/**
 * Imagen de respaldo para Open Graph/Twitter Card cuando una página no tiene
 * foto propia (producto sin imageUrl, categoría sin imageUrl). Al definir
 * `openGraph` en una página, Next reemplaza el objeto completo heredado del
 * layout en vez de mezclarlo campo por campo — sin este fallback explícito,
 * esas páginas quedarían compartiéndose sin ninguna imagen en vez de heredar
 * la del hero como pasaba antes.
 */
export const DEFAULT_OG_IMAGE = {
  url: heroMasVendido.src,
  width: heroMasVendido.width,
  height: heroMasVendido.height,
};
