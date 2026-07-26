-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0010. Ejecuta esto en el SQL Editor.
--
-- Saca la fórmula de respaldo (70%/170% del precio de 5ml) para 3ml/10ml —
-- daba precios poco atractivos (ej. S/.93, S/.111) y el admin siempre va a
-- cargar un precio propio. Ahora 3ml/10ml se comportan igual que "frasco
-- entero": si el producto no tiene ese precio cargado, ese tamaño
-- simplemente no se puede pedir (la página del producto ya lo oculta del
-- selector; esto es la validación autoritativa del lado del servidor).

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
