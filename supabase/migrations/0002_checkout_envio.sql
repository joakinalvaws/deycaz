  -- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1).
  -- Ejecuta esto en el SQL Editor — es seguro correrlo aunque ya tengas pedidos
  -- de prueba (hace backfill en vez de fallar por NOT NULL).

  -- ============================================================
  -- Nuevas columnas en orders
  -- ============================================================
  alter table orders add column if not exists dni text;
  alter table orders add column if not exists provincia text;
  alter table orders add column if not exists distrito text;
  alter table orders add column if not exists shalom_agency text;
  alter table orders add column if not exists shipping_method text;
  alter table orders add column if not exists shipping_cost numeric not null default 0;

  -- order_number: Postgres rellena automáticamente los valores para las filas
  -- existentes al agregar la columna identity.
  alter table orders add column if not exists order_number bigint generated always as identity (start with 1000);

  -- Backfill de filas existentes (pedidos de prueba) para poder exigir NOT NULL de ahora en adelante.
  update orders
  set provincia = coalesce(provincia, 'Lima'),
      distrito = coalesce(distrito, 'Lima'),
      shipping_method = coalesce(shipping_method, 'lima_delivery')
  where provincia is null or distrito is null or shipping_method is null;

  alter table orders alter column provincia set not null;
  alter table orders alter column distrito set not null;
  alter table orders alter column shipping_method set not null;

  do $$
  begin
    if not exists (
      select 1 from pg_constraint where conname = 'orders_shipping_method_check'
    ) then
      alter table orders add constraint orders_shipping_method_check
        check (shipping_method in ('lima_delivery', 'shalom_provincia'));
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'orders_dni_check'
    ) then
      alter table orders add constraint orders_dni_check
        check (dni is null or char_length(dni) between 8 and 12);
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'orders_provincia_check'
    ) then
      alter table orders add constraint orders_provincia_check
        check (char_length(provincia) between 1 and 100);
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'orders_distrito_check'
    ) then
      alter table orders add constraint orders_distrito_check
        check (char_length(distrito) between 1 and 100);
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'orders_shalom_agency_check'
    ) then
      alter table orders add constraint orders_shalom_agency_check
        check (shalom_agency is null or char_length(shalom_agency) <= 200);
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'orders_shipping_cost_check'
    ) then
      alter table orders add constraint orders_shipping_cost_check
        check (shipping_cost >= 0);
    end if;
  end $$;

  -- ============================================================
  -- place_order: reemplaza la función (firma nueva, con envío/DNI/ubigeo)
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
    p_items            jsonb
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
