import type { MetadataRoute } from "next";
import { getSitemapProducts, getSitemapCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getSitemapProducts(), getSitemapCategories()]);
  const now = new Date();

  // Las páginas de listado no tienen una fecha propia en la base de datos
  // (su contenido cambia con el catálogo, no son una fila) — para esas sí
  // tiene sentido "ahora". Productos y categorías sí son filas reales:
  // usan su created_at en vez de la misma fecha repetida en las ~30 URLs.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/promociones`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/combo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/producto/${p.id}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
