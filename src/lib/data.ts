import { supabase } from "./supabase";
import type { Category, Product, ProductImage, Testimonial } from "./types";

function mapProduct(row: {
  id: number;
  name: string;
  category_slug: string;
  price: number;
  price_3ml: number | null;
  price_10ml: number | null;
  price_full_bottle: number | null;
  original_price: number | null;
  badge: string | null;
  best_seller: boolean;
  on_sale: boolean;
  image_url: string | null;
  description: string | null;
}): Product {
  return {
    id: row.id,
    name: row.name,
    categorySlug: row.category_slug,
    price: row.price,
    price3ml: row.price_3ml,
    price10ml: row.price_10ml,
    priceFullBottle: row.price_full_bottle,
    originalPrice: row.original_price,
    badge: row.badge,
    bestSeller: row.best_seller,
    onSale: row.on_sale,
    imageUrl: row.image_url,
    description: row.description,
  };
}

function mapCategory(row: {
  slug: string;
  name: string;
  subtitle: string | null;
  desde: number | null;
}): Category {
  return { slug: row.slug, name: row.name, subtitle: row.subtitle, desde: row.desde };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, subtitle, desde")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  return (data ?? []).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, subtitle, desde")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar la categoría: ${error.message}`);
  return data ? mapCategory(data) : null;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_slug, price, price_3ml, price_10ml, price_full_bottle, original_price, badge, best_seller, on_sale, image_url, description",
    )
    .order("id", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_slug, price, price_3ml, price_10ml, price_full_bottle, original_price, badge, best_seller, on_sale, image_url, description",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el producto: ${error.message}`);
  return data ? mapProduct(data) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_slug, price, price_3ml, price_10ml, price_full_bottle, original_price, badge, best_seller, on_sale, image_url, description",
    )
    .eq("category_slug", categorySlug)
    .order("id", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getBestSellers(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_slug, price, price_3ml, price_10ml, price_full_bottle, original_price, badge, best_seller, on_sale, image_url, description",
    )
    .eq("best_seller", true)
    .order("id", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los más vendidos: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getPromoProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category_slug, price, price_3ml, price_10ml, price_full_bottle, original_price, badge, best_seller, on_sale, image_url, description",
    )
    .eq("on_sale", true)
    .order("id", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las promociones: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, stars, text, image_url")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los testimonios: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    stars: row.stars,
    text: row.text,
    imageUrl: row.image_url,
  }));
}

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("url, size_tag, is_primary, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las imágenes del producto: ${error.message}`);
  return (data ?? []).map((row) => ({
    url: row.url,
    sizeTag: row.size_tag,
    isPrimary: row.is_primary,
  }));
}
