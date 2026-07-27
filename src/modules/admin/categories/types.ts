export type Category = {
  slug: string;
  name: string;
  subtitle: string | null;
  desde: number | null;
  /** Foto de fondo del tile de categoría en la home y /catalogo. */
  image_url: string | null;
  sort_order: number;
  created_at: string;
};
