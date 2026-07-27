import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel ya manda `noindex` por metadata (src/app/admin/layout.tsx),
    // pero eso solo lo ve un bot que ya entró: acá se le dice de antemano
    // que ni lo rastree.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: "https://deycaz.store/sitemap.xml",
  };
}
