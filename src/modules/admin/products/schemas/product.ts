import { z } from "zod";

// Un solo schema, un solo submit — el formulario se organiza en tabs
// (General/Precio/Inventario/Imágenes/SEO) por componente, pero guardar es
// una sola entidad. Guardar "Precio" mientras "General" tiene un campo
// inválido sin guardar sería una fuente clásica de bugs de datos para un
// beneficio marginal en un formulario de un producto.
export const productSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
    category_slug: z.string().min(1, "Elige una categoría."),
    price: z.number().positive("El precio debe ser mayor a 0."),
    // Precios propios por tamaño — si quedan vacíos, el sitio público usa la
    // fórmula vieja (70%/170% de `price`) como valor por defecto. El
    // formulario los sugiere automáticamente a partir de `price` mientras no
    // se hayan editado a mano (ver ProductForm).
    price_3ml: z.number().positive().nullable().optional(),
    price_10ml: z.number().positive().nullable().optional(),
    // Frasco entero: tamaño nuevo, sin fórmula — si queda vacío, esa opción
    // simplemente no aparece en la página del producto.
    price_full_bottle: z.number().positive().nullable().optional(),
    on_sale: z.boolean(),
    original_price: z.number().positive().nullable().optional(),
    badge: z.string().trim().max(50).nullable().optional(),
    best_seller: z.boolean(),
    active: z.boolean(),
    description: z.string().trim().max(2000).nullable().optional(),
    // Productos recomendados para "Combínalo y ahorra" — solo se usan
    // cuando on_sale=true (ver ProductForm).
    addon_product_id_1: z.number().int().positive().nullable().optional(),
    addon_product_id_2: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => !data.on_sale || (data.original_price != null && data.original_price > data.price), {
    message: "Si está en oferta, el precio anterior debe ser mayor al precio actual.",
    path: ["original_price"],
  });

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  name: "",
  category_slug: "",
  price: 0,
  price_3ml: null,
  price_10ml: null,
  price_full_bottle: null,
  on_sale: false,
  original_price: null,
  badge: null,
  best_seller: false,
  active: true,
  description: null,
  addon_product_id_1: null,
  addon_product_id_2: null,
};
