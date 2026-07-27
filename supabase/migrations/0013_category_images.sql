-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0012. Ejecuta esto en el SQL Editor.
--
-- Foto de fondo por categoría. Los tiles de categoría (home y /catalogo)
-- siempre se diseñaron con una foto de fondo detrás del nombre, pero
-- `categories` nunca tuvo dónde guardarla: `CategoryTile` recibía
-- `imageUrl={null}` fijo desde las dos páginas y terminaba renderizando el
-- placeholder "Foto próximamente" debajo del degradado oscuro. Esto cierra
-- esa feature a medio terminar.
--
-- `image_url` en null se sigue soportando: el tile cae al fondo oscuro sin
-- foto (ya no al placeholder, ver src/components/CategoryTile.tsx).

alter table categories add column if not exists image_url text;

-- Bucket propio en vez de reusar 'product-images': las fotos de categoría
-- tienen otro ciclo de vida (una por categoría, se reemplaza sola) y
-- mezclarlas volvía ambiguo el borrado por prefijo de producto.
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- Mismas policies que 'product-images' (ver 0008): lectura pública porque
-- el sitio las muestra sin login, escritura solo para admins.
create policy "category_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'category-images');

create policy "category_images_storage_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'category-images' and is_admin());

create policy "category_images_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'category-images' and is_admin())
  with check (bucket_id = 'category-images' and is_admin());

create policy "category_images_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'category-images' and is_admin());
