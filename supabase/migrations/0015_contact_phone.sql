-- Migración para el proyecto Supabase que ya corrió supabase/schema.sql (v1)
-- y las migraciones 0002-0014. Ejecuta esto en el SQL Editor.
--
-- Agrega el campo "Número" al formulario de Contacto. Nullable a nivel de
-- base (para no romper filas ya insertadas) — lo obligatorio se valida en
-- la capa de aplicación (submitContact, src/app/actions.ts), igual que el
-- resto de los campos de este formulario.

alter table contact_messages add column if not exists phone text
  check (phone is null or char_length(phone) <= 20);
