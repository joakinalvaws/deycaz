-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0015. Ejecuta esto en el SQL Editor.
--
-- Agrega hasta dos productos "recomendados" por producto, usados por la
-- sección "COMBÍNALO Y AHORRA" de la página de producto — solo se muestra
-- en productos en oferta (on_sale = true) que tengan al menos uno de los
-- dos configurado. Dos columnas nullable alcanzan (no hace falta una tabla
-- de unión): el máximo es 2 recomendaciones fijas por producto, no una
-- lista abierta.
--
-- on delete set null: si se borra el producto recomendado, la referencia
-- se limpia sola en vez de bloquear el delete con un error de FK genérico
-- (deleteProduct en el admin no maneja ese caso hoy).

alter table products
  add column if not exists addon_product_id_1 bigint references products(id) on delete set null,
  add column if not exists addon_product_id_2 bigint references products(id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_addon_1_not_self') then
    alter table products add constraint products_addon_1_not_self
      check (addon_product_id_1 is null or addon_product_id_1 <> id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_addon_2_not_self') then
    alter table products add constraint products_addon_2_not_self
      check (addon_product_id_2 is null or addon_product_id_2 <> id);
  end if;
end $$;
