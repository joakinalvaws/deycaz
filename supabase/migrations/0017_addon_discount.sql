-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0016. Ejecuta esto en el SQL Editor.
--
-- "Combínalo y ahorra" (PDP de una promoción) tenía el nombre pero no el
-- descuento: los addons se cobraban a precio de lista completo. Agrega un
-- descuento fijo de S/.10 por unidad para todo item marcado is_addon=true
-- en el payload — se resta sobre el precio ya calculado (combo o
-- individual), nunca por debajo de S/.0. Mantener sincronizado con
-- ADDON_DISCOUNT en src/lib/pricing.ts.
--
-- Único cambio respecto a la función de 0014: el bloque nuevo justo antes
-- de acumular v_subtotal, adentro del loop de items. La firma no cambia.

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
  p_items            jsonb  -- [{product_id, size, qty, is_combo, is_addon}, ...]
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

  -- Topes de sanidad: esta función tiene `grant execute ... to anon`
  -- (el checkout es público), así que cualquiera puede llamarla directo por
  -- REST. Mantener sincronizado con MAX_QTY_PER_LINE / MAX_LINES_PER_ORDER
  -- en src/app/actions.ts.
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

    -- Descuento fijo de "Combínalo y ahorra" (PDP de una promoción) — el
    -- cliente lo agrega marcado is_addon=true, y acá se le resta el
    -- descuento por unidad al precio ya calculado arriba (sea de combo o
    -- individual). Mantener sincronizado con ADDON_DISCOUNT en
    -- src/lib/pricing.ts.
    if coalesce((v_item->>'is_addon')::boolean, false) then
      v_unit_price := greatest(v_unit_price - 10, 0);
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
