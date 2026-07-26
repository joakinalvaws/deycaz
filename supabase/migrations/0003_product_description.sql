-- Agrega descripción por producto (opcional). Si queda vacía para un
-- producto, la página sigue mostrando el texto genérico de siempre.
alter table products add column if not exists description text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_description_check'
  ) then
    alter table products add constraint products_description_check
      check (description is null or char_length(description) <= 2000);
  end if;
end $$;
