-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0009. Ejecuta esto en el SQL Editor.
--
-- Agrega una etiqueta opcional de tamaño a product_images, aditiva — no
-- toca is_primary/sort_order/url existentes. Con esto cada imagen de un
-- producto es una de tres cosas: la principal (is_primary=true, la que ya
-- sincroniza con products.image_url para el card), una imagen específica
-- de un tamaño (size_tag), o una foto suelta de la galería general
-- (ninguna de las dos, como ya funcionaba).

alter table product_images add column if not exists size_tag text
  check (size_tag is null or size_tag in ('3', '5', '10', 'full'));

-- A lo sumo una imagen por tamaño por producto — subir una nueva para el
-- mismo tamaño reemplaza la anterior (la aplicación borra la fila vieja
-- antes de insertar), nunca se acumulan varias para el mismo tamaño.
create unique index if not exists product_images_one_per_size_tag
  on product_images(product_id, size_tag) where size_tag is not null;
