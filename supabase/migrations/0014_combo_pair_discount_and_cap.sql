-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0013. Ejecuta esto en el SQL Editor.
--
-- Reemplaza el descuento plano de "Arma tu Combo" (un solo monto según la
-- cantidad TOTAL de combo en el pedido, sin distinguir categoría ni
-- tamaño) por un descuento independiente por cada par (categoría, tamaño),
-- sumado entre todos los pares presentes. Ej.: 3 decants Árabes-3ml
-- (S/.10 de descuento) + 3 Árabes-10ml (S/.30) = S/.40 en total, en vez de
-- un único nivel por 6 decants totales.
--
-- Mantener sincronizada la tabla de combo_pair_discount() con
-- COMBO_PAIR_DISCOUNT_TABLE en src/lib/bundleDiscount.ts.
--
-- También agrega el tope de 6 unidades máximo por cada par (categoría,
-- tamaño) — antes no existía ningún tope específico de combo (solo los
-- topes genéricos de MAX_QTY_PER_LINE/MAX_LINES_PER_ORDER de la migración
-- 0012, que siguen intactos). Si algún par supera 6, se rechaza el pedido
-- completo (no se recorta en silencio) — mismo criterio que el resto de
-- esta función: nunca clampa, siempre `raise exception`. En operación
-- normal esto no debería dispararse nunca porque la UI ya bloquea
-- (opacidad + disabled) los productos de un par al llegar a 6; es una red
-- de seguridad ante una llamada directa a la API que se salte la UI.
--
-- La firma de place_order no cambia (mismos 10 parámetros).

create or replace function public.combo_pair_discount(
  p_category_slug text,
  p_size          text,
  p_qty           int
) returns numeric
language sql
immutable
as $$
  select coalesce(
    case
      when p_qty < 2 then 0
      when p_category_slug = 'arabes' and p_size = '3' then
        case least(p_qty,6) when 2 then 5 when 3 then 10 when 4 then 20 when 5 then 25 when 6 then 30 end
      when p_category_slug = 'arabes' and p_size = '5' then
        case least(p_qty,6) when 2 then 10 when 3 then 20 when 4 then 40 when 5 then 50 when 6 then 60 end
      when p_category_slug = 'arabes' and p_size = '10' then
        case least(p_qty,6) when 2 then 10 when 3 then 30 when 4 then 40 when 5 then 50 when 6 then 60 end
      when p_category_slug = 'disenador' and p_size = '3' then
        case least(p_qty,6) when 2 then 7 when 3 then 15 when 4 then 30 when 5 then 37 when 6 then 45 end
      when p_category_slug = 'disenador' and p_size = '5' then
        case least(p_qty,6) when 2 then 15 when 3 then 30 when 4 then 60 when 5 then 75 when 6 then 90 end
      when p_category_slug = 'disenador' and p_size = '10' then
        case least(p_qty,6) when 2 then 15 when 3 then 45 when 4 then 60 when 5 then 75 when 6 then 90 end
      when p_category_slug = 'exclusivos' and p_size = '3' then
        case least(p_qty,6) when 2 then 25 when 3 then 50 when 4 then 100 when 5 then 125 when 6 then 150 end
      when p_category_slug = 'exclusivos' and p_size = '5' then
        case least(p_qty,6) when 2 then 50 when 3 then 100 when 4 then 200 when 5 then 250 when 6 then 300 end
      when p_category_slug = 'exclusivos' and p_size = '10' then
        case least(p_qty,6) when 2 then 50 when 3 then 150 when 4 then 200 when 5 then 250 when 6 then 300 end
      when p_category_slug = 'nicho' and p_size = '3' then
        case least(p_qty,6) when 2 then 10 when 3 then 20 when 4 then 40 when 5 then 50 when 6 then 60 end
      when p_category_slug = 'nicho' and p_size = '5' then
        case least(p_qty,6) when 2 then 20 when 3 then 40 when 4 then 80 when 5 then 100 when 6 then 120 end
      when p_category_slug = 'nicho' and p_size = '10' then
        case least(p_qty,6) when 2 then 20 when 3 then 60 when 4 then 80 when 5 then 100 when 6 then 120 end
      else 0
    end,
    0
  );
$$;

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
  v_pair_qty                 jsonb := '{}'::jsonb;
  v_pair_key                 text;
  v_pair_rec                 record;
  v_combo_pair_over_cap      boolean := false;
  v_bundle_discount          numeric := 0;
  v_subtotal_after_discount  numeric := 0;
  v_computed                 jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  if jsonb_array_length(p_items) > 40 then
    raise exception 'El pedido tiene demasiados productos distintos';
  end if;

  -- Se valida con regex antes de castear: un `qty` no numérico haría fallar
  -- el cast con un error de Postgres crudo en vez de este mensaje.
  if exists (
    select 1
    from jsonb_array_elements(p_items) i
    where coalesce(i->>'qty', '') !~ '^[0-9]+$'
       or (i->>'qty')::int < 1
       or (i->>'qty')::int > 50
  ) then
    raise exception 'Cantidad inválida: máximo 50 unidades por producto';
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
      -- calcula aparte, por cada par (categoría, tamaño), más abajo.
      v_unit_price := v_flat_price;

      -- Acumula la cantidad de este par (categoría, tamaño) — v_product ya
      -- viene de la tabla real (confiable), nunca del payload del cliente.
      v_pair_key := v_product.category_slug || '::' || (v_item->>'size');
      v_pair_qty := jsonb_set(
        v_pair_qty,
        array[v_pair_key],
        to_jsonb(coalesce((v_pair_qty->>v_pair_key)::int, 0) + (v_item->>'qty')::int)
      );
    else
      if (v_item->>'size') = 'full' and v_product.price_full_bottle is null then
        raise exception 'Este producto no tiene precio de frasco entero configurado';
      end if;
      if (v_item->>'size') = '3' and v_product.price_3ml is null then
        raise exception 'Este producto no tiene precio de 3ml configurado';
      end if;
      if (v_item->>'size') = '10' and v_product.price_10ml is null then
        raise exception 'Este producto no tiene precio de 10ml configurado';
      end if;
      v_unit_price := case (v_item->>'size')
        when '3' then v_product.price_3ml
        when '10' then v_product.price_10ml
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

  -- Descuento de "Arma tu Combo": independiente por cada par (categoría,
  -- tamaño) acumulado en v_pair_qty durante el loop de arriba, luego
  -- sumados — sin término cruzado entre pares distintos. Mantener
  -- combo_pair_discount() sincronizada con COMBO_PAIR_DISCOUNT_TABLE en
  -- src/lib/bundleDiscount.ts.
  for v_pair_rec in
    select key as pair_key, value::int as qty
    from jsonb_each_text(v_pair_qty)
  loop
    if v_pair_rec.qty > 6 then
      v_combo_pair_over_cap := true;
    end if;
    v_bundle_discount := v_bundle_discount + public.combo_pair_discount(
      split_part(v_pair_rec.pair_key, '::', 1),
      split_part(v_pair_rec.pair_key, '::', 2),
      v_pair_rec.qty
    );
  end loop;

  -- Tope de sanidad: 6 unidades máximo por cada par (categoría, tamaño) de
  -- combo. La UI ya bloquea (opacidad + disabled) los perfumes de un par
  -- al llegar a 6, así que en operación normal esto nunca debería
  -- dispararse — es una red de seguridad ante una llamada directa a la API
  -- que se salte la UI (mismo criterio que los chequeos de arriba de `qty`
  -- y de `jsonb_array_length`). Se rechaza el pedido completo en vez de
  -- recortar la cantidad en silencio.
  if v_combo_pair_over_cap then
    raise exception 'Cada categoría y tamaño admite un máximo de 6 unidades en Arma tu Combo';
  end if;

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
