-- Foto de fondo opcional por testimonio (cliente con su producto). Si queda
-- vacía, la tarjeta se ve igual que antes (fondo blanco).
alter table testimonials add column if not exists image_url text;
