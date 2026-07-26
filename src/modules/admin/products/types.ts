export type Product = {
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
  active: boolean;
  created_at: string;
};

export type ProductImage = {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};
