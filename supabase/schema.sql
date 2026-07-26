-- DEYCAZ — esquema de base de datos
-- Ejecutar en el SQL Editor de tu proyecto Supabase (o via `supabase db push`).

-- ============================================================
-- CATEGORÍAS
-- ============================================================
create table if not exists categories (
  slug        text primary key,
  name        text not null,
  subtitle    text,
  desde       numeric,           -- precio "desde" mostrado en Arma tu Combo; null para 'promos'
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;

create policy "categories_public_read" on categories
  for select using (true);

-- ============================================================
-- PRODUCTOS
-- ============================================================
create table if not exists products (
  id              bigint generated always as identity primary key,
  name            text not null,
  category_slug   text not null references categories(slug),
  price           numeric not null check (price > 0),        -- precio base (equivale al tamaño 5ml)
  -- Overrides opcionales por tamaño — si son null, el precio de ese tamaño
  -- se sigue calculando con la fórmula vieja (70%/170% de `price`) como
  -- valor por defecto. `price_full_bottle` es un tamaño nuevo (perfume
  -- completo, no decant); si queda null, ese producto simplemente no
  -- ofrece la opción de frasco entero.
  price_3ml         numeric check (price_3ml is null or price_3ml > 0),
  price_10ml        numeric check (price_10ml is null or price_10ml > 0),
  price_full_bottle numeric check (price_full_bottle is null or price_full_bottle > 0),
  original_price  numeric check (original_price is null or original_price > price),
  badge           text,
  best_seller     boolean not null default false,
  on_sale         boolean not null default false,
  image_url       text,          -- null => el frontend usa un placeholder
  -- null => la página de producto muestra el texto genérico de siempre.
  description     text check (description is null or char_length(description) <= 2000),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_slug);

alter table products enable row level security;

create policy "products_public_read_active" on products
  for select using (active = true);

-- ============================================================
-- TESTIMONIOS
-- ============================================================
create table if not exists testimonials (
  id          bigint generated always as identity primary key,
  name        text not null,
  stars       smallint not null default 5 check (stars between 1 and 5),
  text        text not null,
  image_url   text,          -- null => la tarjeta usa fondo blanco de siempre
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "testimonials_public_read" on testimonials
  for select using (true);

-- ============================================================
-- PEDIDOS (pago contra entrega por ahora — ver nota de pasarela abajo)
-- ============================================================
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      bigint generated always as identity (start with 1000) unique not null,
  customer_name     text not null check (char_length(customer_name) between 1 and 200),
  customer_phone    text not null check (char_length(customer_phone) between 1 and 40),
  -- DNI solo es obligatorio (validado en place_order) cuando shipping_method = 'shalom_provincia'.
  dni               text check (dni is null or char_length(dni) between 8 and 12),
  provincia         text not null check (char_length(provincia) between 1 and 100),
  distrito          text not null check (char_length(distrito) between 1 and 100),
  customer_address  text not null check (char_length(customer_address) between 1 and 400),
  -- shalom_agency solo se llena (y es obligatoria) cuando shipping_method = 'shalom_provincia'.
  shalom_agency     text check (shalom_agency is null or char_length(shalom_agency) <= 200),
  shipping_method   text not null check (shipping_method in ('lima_delivery', 'shalom_provincia')),
  -- Costo de envío cobrado por la tienda: para Shalom siempre 0 porque el
  -- cliente paga el flete directamente en la agencia al recoger.
  shipping_cost     numeric not null default 0 check (shipping_cost >= 0),
  notes             text check (notes is null or char_length(notes) <= 500),
  -- payment_method solo admite 'cod' (contra entrega) hoy. Cuando se diseñe la
  -- pasarela de pago, se agrega el nuevo valor aquí (ej. 'card', 'yape') y en
  -- src/lib/pricing.ts / CheckoutModal no se toca el resto del flujo.
  payment_method    text not null default 'cod' check (payment_method in ('cod')),
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal          numeric not null default 0,
  discount          numeric not null default 0,
  total             numeric not null default 0,
  created_at        timestamptz not null default now()
);

alter table orders enable row level security;
-- Sin policies públicas: solo se escribe a través de la función place_order()
-- (SECURITY DEFINER) y se lee desde el panel admin con la service role key.

-- ============================================================
-- ITEMS DE PEDIDO
-- ============================================================
create table if not exists order_items (
  id            bigint generated always as identity primary key,
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    bigint not null references products(id),
  product_name  text not null,   -- snapshot: se conserva aunque el producto cambie/se borre
  size          text not null check (size in ('3','5','10','full')),
  unit_price    numeric not null check (unit_price >= 0),
  qty           int not null check (qty > 0),
  is_combo      boolean not null default false
);

alter table order_items enable row level security;
-- Igual que orders: sin policies públicas, solo vía place_order().

-- ============================================================
-- MENSAJES DE CONTACTO
-- ============================================================
create table if not exists contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 200),
  message     text not null check (char_length(message) between 1 and 2000),
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "contact_messages_public_insert" on contact_messages
  for insert with check (true);
-- Sin policy de select pública: el panel admin lee con la service role key.

-- ============================================================
-- FUNCIÓN: place_order
--
-- Crea el pedido y sus items en una sola transacción, recalculando TODOS
-- los precios y el costo de envío en el servidor (nunca confía en lo
-- enviado desde el cliente). Reglas de precio:
--   - Item individual: usa el precio propio del tamaño si el producto lo
--     tiene cargado (price_3ml/price_10ml/price_full_bottle); si no,
--     3ml/10ml caen al valor por defecto base*0.7 / base*1.7 (redondeado).
--     'full' (frasco entero) exige que el producto tenga price_full_bottle
--     configurado, y nunca puede pedirse como parte de un combo.
--   - Item de "Arma tu Combo" (is_combo=true): precio plano por tamaño
--     (3ml=S/.30, 5ml=S/.45, 10ml=S/.75), sin descuento incrustado por
--     unidad. El descuento se resta una sola vez sobre el subtotal total,
--     según la cantidad total de combo en el pedido, con niveles fijos en
--     soles (mantener sincronizado con BUNDLE_DISCOUNT_TIERS en
--     src/lib/bundleDiscount.ts): 1→S/.0, 2→S/.10, 3→S/.20, 4→S/.35,
--     5→S/.45, 6+→S/.50 (nunca se acumulan niveles).
--   - Envío: 'lima_delivery' gratis desde S/.250 de subtotal con descuento
--     ya aplicado, si no S/.15.
--     'shalom_provincia' siempre S/.0 para la tienda — el cliente paga el
--     flete directamente en la agencia Shalom al recoger su pedido.
--   - DNI y Agencia Shalom son obligatorios solo si shipping_method es
--     'shalom_provincia' (esa agencia los pide para el recojo).
-- Devuelve order_number (no el uuid interno) — es el único dato que
-- necesita el cliente para armar el mensaje de confirmación por WhatsApp.
-- ============================================================
drop function if exists public.place_order(text, text, text, text, jsonb);

create or replace function public.place_order(
  p_customer_name    text,
  p_customer_phone   text,
  p_dni              text,
  p_provincia        text,
  p_distrito         text,
  p_customer_address text,
  p_shalom_agency    text,
  p_shipping_method  text,
  p_notes            text,
  p_items            jsonb  -- [{product_id, size, qty, is_combo}, ...]
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id                uuid;
  v_order_number            bigint;
  v_item                    jsonb;
  v_product                 products%rowtype;
  v_unit_price               numeric;
  v_flat_price               numeric;
  v_subtotal                 numeric := 0;
  v_shipping_cost            numeric := 0;
  v_combo_qty                int := 0;
  v_bundle_discount          numeric := 0;
  v_subtotal_after_discount  numeric := 0;
  v_computed                 jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  if p_shipping_method not in ('lima_delivery', 'shalom_provincia') then
    raise exception 'Método de envío inválido';
  end if;

  if p_shipping_method = 'shalom_provincia' then
    if p_dni is null or length(trim(p_dni)) = 0 then
      raise exception 'El DNI es obligatorio para envíos por Shalom';
    end if;
    if p_shalom_agency is null or length(trim(p_shalom_agency)) = 0 then
      raise exception 'La agencia Shalom es obligatoria para este método de envío';
    end if;
  end if;

  select coalesce(sum((i->>'qty')::int), 0) into v_combo_qty
  from jsonb_array_elements(p_items) i
  where coalesce((i->>'is_combo')::boolean, false) is true;

  -- Tabla de niveles fijos: mantener sincronizada con
  -- BUNDLE_DISCOUNT_TIERS en src/lib/bundleDiscount.ts.
  v_bundle_discount := case
    when v_combo_qty >= 6 then 50
    when v_combo_qty >= 5 then 45
    when v_combo_qty >= 4 then 35
    when v_combo_qty >= 3 then 20
    when v_combo_qty >= 2 then 10
    else 0
  end;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from products
    where id = (v_item->>'product_id')::bigint and active = true;

    if not found then
      raise exception 'Producto % no disponible', (v_item->>'product_id');
    end if;

    if (v_item->>'size') not in ('3','5','10','full') then
      raise exception 'Tamaño inválido';
    end if;

    if coalesce((v_item->>'is_combo')::boolean, false) then
      if (v_item->>'size') = 'full' then
        raise exception 'El frasco entero no puede agregarse como combo';
      end if;
      v_flat_price := case (v_item->>'size')
        when '3' then 30 when '5' then 45 when '10' then 75
      end;
      -- Precio plano, sin descuento incrustado por unidad: el descuento se
      -- resta una sola vez sobre el subtotal total del pedido (más abajo).
      v_unit_price := v_flat_price;
    else
      if (v_item->>'size') = 'full' and v_product.price_full_bottle is null then
        raise exception 'Este producto no tiene precio de frasco entero configurado';
      end if;
      v_unit_price := case (v_item->>'size')
        when '3' then coalesce(v_product.price_3ml, round(v_product.price * 0.7))
        when '10' then coalesce(v_product.price_10ml, round(v_product.price * 1.7))
        when 'full' then v_product.price_full_bottle
        else v_product.price
      end;
    end if;

    v_subtotal := v_subtotal + v_unit_price * (v_item->>'qty')::int;

    v_computed := v_computed || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'size', v_item->>'size',
      'unit_price', v_unit_price,
      'qty', (v_item->>'qty')::int,
      'is_combo', coalesce((v_item->>'is_combo')::boolean, false)
    );
  end loop;

  v_subtotal_after_discount := greatest(v_subtotal - v_bundle_discount, 0);

  if p_shipping_method = 'lima_delivery' then
    v_shipping_cost := case when v_subtotal_after_discount >= 250 then 0 else 15 end;
  else
    v_shipping_cost := 0;
  end if;

  insert into orders (
    customer_name, customer_phone, dni, provincia, distrito, customer_address,
    shalom_agency, shipping_method, shipping_cost, notes, subtotal, discount, total
  )
  values (
    p_customer_name, p_customer_phone, nullif(trim(p_dni), ''), p_provincia, p_distrito,
    p_customer_address, nullif(trim(p_shalom_agency), ''), p_shipping_method, v_shipping_cost,
    nullif(p_notes, ''), v_subtotal, v_bundle_discount, v_subtotal_after_discount + v_shipping_cost
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(v_computed)
  loop
    insert into order_items (order_id, product_id, product_name, size, unit_price, qty, is_combo)
    values (
      v_order_id, (v_item->>'product_id')::bigint, v_item->>'product_name', v_item->>'size',
      (v_item->>'unit_price')::numeric, (v_item->>'qty')::int, (v_item->>'is_combo')::boolean
    );
  end loop;

  return v_order_number;
end;
$$;

grant execute on function public.place_order(text, text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;

-- ============================================================
-- PANEL ADMINISTRATIVO (agregado en migración 0007)
-- ============================================================
-- Un solo rol hoy ('owner', dueño único) — agregar 'staff' en el futuro es
-- ampliar este check + las policies que lo necesiten, no un cambio de
-- arquitectura. Sin policies públicas ni de admin sobre esta tabla: se
-- administra a mano desde el SQL Editor / Table Editor.
create table if not exists admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'owner' check (role in ('owner')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

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

-- IMPORTANTE: también a `anon` — las policies de admin de abajo se evalúan
-- para TODA request a esas tablas, incluidas las públicas del sitio (anon).
-- Sin este grant, el catálogo público dejaría de funcionar.
grant execute on function public.is_admin() to anon, authenticated;

-- Galería de imágenes por producto (products.image_url sigue existiendo,
-- es la imagen que muestra el sitio público; se mantiene sincronizada
-- desde el admin al marcar una imagen como principal).
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

-- Policies de admin — adicionales, conviven con las públicas ya definidas
-- arriba (Postgres combina policies del mismo comando con OR).
create policy "products_admin_all" on products for all using (is_admin()) with check (is_admin());
create policy "categories_admin_all" on categories for all using (is_admin()) with check (is_admin());
create policy "testimonials_admin_all" on testimonials for all using (is_admin()) with check (is_admin());

-- orders/order_items: el INSERT sigue siendo exclusivo de place_order()
-- (security definer, no lo afecta RLS) — el admin solo lee y actualiza
-- pedidos ya creados, nunca inserta a mano.
create policy "orders_admin_select" on orders for select using (is_admin());
create policy "orders_admin_update" on orders for update using (is_admin()) with check (is_admin());
create policy "order_items_admin_select" on order_items for select using (is_admin());

create policy "contact_messages_admin_select" on contact_messages for select using (is_admin());
create policy "contact_messages_admin_update" on contact_messages for update using (is_admin()) with check (is_admin());

-- Bucket de Storage para las fotos de producto subidas desde el admin
-- (público — el sitio público las muestra sin login). `storage.objects`
-- tiene su propio RLS, separado del de las tablas normales.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_storage_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());
