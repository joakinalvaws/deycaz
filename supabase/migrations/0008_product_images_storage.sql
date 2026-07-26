-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0007. Ejecuta esto en el SQL Editor.
--
-- La subida de imágenes desde el panel admin (product_images) fallaba: el
-- bucket "product-images" de Supabase Storage no existía, y aunque hubiera
-- existido, `storage.objects` tiene RLS propio (separado del RLS de las
-- tablas normales) sin ninguna policy para este bucket — por eso daba error
-- al subir aunque `is_admin()` ya estuviera bien configurado en 0007.

-- Crea el bucket si todavía no existe (público: las fotos de producto son
-- públicas en el sitio, igual que ya funciona con products.image_url).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública (el sitio público muestra estas fotos sin login).
create policy "product_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo admins pueden subir/actualizar/borrar archivos en este bucket.
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
