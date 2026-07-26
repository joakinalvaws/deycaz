-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0006. Ejecuta esto en el SQL Editor.
--
-- Agrega la base de autenticación del panel administrativo:
--   - tabla admin_users (un solo rol 'owner' por ahora, ver comentario abajo)
--   - función is_admin() usada por las policies nuevas
--   - policies de admin en products/categories/testimonials/orders/order_items/
--     contact_messages (además de las públicas ya existentes, nunca las
--     reemplazan — Postgres combina policies del mismo comando con OR)
--   - tabla product_images (galería de imágenes por producto; hoy
--     products.image_url es un solo string, no soporta reordenar ni
--     múltiples imágenes)
--
-- Después de correr esto: crear el primer usuario admin a mano
--   1. Supabase Studio → Authentication → Add user (email + password)
--   2. SQL Editor → insert into admin_users (id, email) values
--      ('<uuid del usuario recién creado>', '<su email>');

-- ============================================================
-- admin_users
-- ============================================================
create table if not exists admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  -- Un solo rol hoy (dueño único) — agregar 'staff' en el futuro es
  -- ampliar este check + las policies que lo necesiten, no un cambio
  -- de arquitectura.
  role       text not null default 'owner' check (role in ('owner')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;
-- Sin policies públicas ni de admin: esta tabla se administra a mano desde
-- el SQL Editor / Table Editor, igual que el resto de la configuración de
-- una sola vez en este proyecto (ver GUIA-INVENTARIO.md).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where id = auth.uid() and active
  );
$$;

-- IMPORTANTE: también a `anon`, no solo `authenticated` — las policies de
-- admin nuevas (más abajo) se evalúan para TODA request a esas tablas,
-- incluidas las públicas del sitio (anon). Sin este grant, el catálogo
-- público dejaría de funcionar (error de permisos al evaluar la policy).
grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- product_images
-- ============================================================
create table if not exists product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products(id) on delete cascade,
  url         text not null,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images(product_id);
alter table product_images enable row level security;
create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_all" on product_images for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Policies de admin (adicionales — conviven con las públicas existentes)
-- ============================================================
create policy "products_admin_all" on products for all using (is_admin()) with check (is_admin());
create policy "categories_admin_all" on categories for all using (is_admin()) with check (is_admin());
create policy "testimonials_admin_all" on testimonials for all using (is_admin()) with check (is_admin());

-- orders/order_items: el INSERT sigue siendo exclusivo de place_order()
-- (security definer, no lo afecta RLS) — el admin solo lee y actualiza
-- status/notes de pedidos ya creados, nunca inserta pedidos a mano.
create policy "orders_admin_select" on orders for select using (is_admin());
create policy "orders_admin_update" on orders for update using (is_admin()) with check (is_admin());
create policy "order_items_admin_select" on order_items for select using (is_admin());

create policy "contact_messages_admin_select" on contact_messages for select using (is_admin());
create policy "contact_messages_admin_update" on contact_messages for update using (is_admin()) with check (is_admin());
