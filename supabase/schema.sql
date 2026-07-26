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
  original_price  numeric check (original_price is null or original_price > price),
  badge           text,
  best_seller     boolean not null default false,
  on_sale         boolean not null default false,
  image_url       text,          -- null => el frontend usa un placeholder
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
  size          text not null check (size in ('3','5','10')),
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
--   - Item individual: 3ml = base*0.7, 5ml = base, 10ml = base*1.7 (redondeado)
--   - Item de "Arma tu Combo" (is_combo=true): precio plano por tamaño
--     (3ml=S/.30, 5ml=S/.45, 10ml=S/.75) con descuento por cantidad total
--     de combo en el pedido: 10% desde 2 unidades, 15% desde 4.
--   - Envío: 'lima_delivery' gratis desde S/.200 de subtotal, si no S/.15.
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
  v_order_id      uuid;
  v_order_number  bigint;
  v_item          jsonb;
  v_product       products%rowtype;
  v_unit_price    numeric;
  v_flat_price    numeric;
  v_subtotal      numeric := 0;
  v_shipping_cost numeric := 0;
  v_combo_qty     int := 0;
  v_combo_rate    numeric := 0;
  v_computed      jsonb := '[]'::jsonb;
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

  v_combo_rate := case
    when v_combo_qty >= 4 then 0.15
    when v_combo_qty >= 2 then 0.10
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

    if (v_item->>'size') not in ('3','5','10') then
      raise exception 'Tamaño inválido';
    end if;

    if coalesce((v_item->>'is_combo')::boolean, false) then
      v_flat_price := case (v_item->>'size')
        when '3' then 30 when '5' then 45 when '10' then 75
      end;
      v_unit_price := round(v_flat_price * (1 - v_combo_rate));
    else
      v_unit_price := case (v_item->>'size')
        when '3' then round(v_product.price * 0.7)
        when '10' then round(v_product.price * 1.7)
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

  if p_shipping_method = 'lima_delivery' then
    v_shipping_cost := case when v_subtotal >= 200 then 0 else 15 end;
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
    nullif(p_notes, ''), v_subtotal, 0, v_subtotal + v_shipping_cost
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
