-- Datos de ejemplo (los mismos del prototipo) para poder ver el sitio
-- funcionando de inmediato. Reemplaza/edita libremente desde el panel de
-- Supabase o tu futuro panel admin.

insert into categories (slug, name, subtitle, desde, sort_order) values
  ('nicho',      'Nicho',      'Xerjoff · Tom Ford · Parfums de Marly', 80,   1),
  ('disenador',  'Diseñador',  'Valentino · Dior · Armani · YSL',       30,   2),
  ('arabes',     'Árabes',     'Lattafa · Rasasi · Afnan',              25,   3),
  ('exclusivos', 'Exclusivos', 'Louis Vuitton · Creed · Tom Ford',      135,  4),
  ('damas',      'Damas',      'Dior · YSL · Chanel',                   35,   5),
  ('promos',     'Promos',     'Ofertas por tiempo limitado',           null, 6)
on conflict (slug) do nothing;

insert into products (name, category_slug, price, original_price, badge, best_seller, on_sale) values
  ('Erba Pura',                        'nicho',      89,  135, 'MÁS VENDIDO', true,  true),
  ('Valentino Born in Roma Intense',   'disenador',  30,  null, null,         true,  false),
  ('Valentino Coral Fantasy',          'disenador',  30,  null, null,         false, false),
  ('Valentino Purple Melancholia',     'disenador',  30,  null, null,         false, false),
  ('Stronger With You Intensely',      'disenador',  30,  null, null,         true,  false),
  ('Stronger With You Powerfully',     'disenador',  30,  null, null,         false, false),
  ('Armani Power Of You',              'disenador',  30,  null, null,         false, false),
  ('Acqua Di Gio Parfum',              'disenador',  30,  null, null,         true,  false),
  ('Acqua Di Gio Profondo EDP',        'disenador',  30,  null, null,         false, false),
  ('Bleu de Chanel EDP',               'disenador',  30,  null, null,         false, false),
  ('Dior Sauvage EDP',                 'disenador',  30,  null, null,         true,  false),
  ('Lattafa Yara',                     'arabes',     25,  null, null,         true,  false),
  ('Rasasi Hawas',                     'arabes',     25,  null, null,         false, false),
  ('Afnan 9pm',                        'arabes',     25,  null, null,         false, false),
  ('Louis Vuitton Ombre Nomade',       'exclusivos', 135, null, null,         false, false),
  ('Creed Aventus',                    'exclusivos', 135, 160, null,         true,  true),
  ('Tom Ford Oud Wood',                'exclusivos', 135, null, null,         false, false),
  ('Miss Dior',                        'damas',      35,  null, null,         true,  false),
  ('YSL Libre',                        'damas',      35,  null, null,         true,  false),
  ('Chanel Coco Mademoiselle',         'damas',      35,  45,  null,         false, true)
on conflict do nothing;

insert into testimonials (name, stars, text, sort_order) values
  ('Camila R.', 5, 'Excelente calidad, se siente igual al original. Llegó en 2 días.', 1),
  ('Jorge M.',  5, 'Compré el combo y ahorré bastante. Muy recomendado.', 2),
  ('Andrea T.', 5, 'Atención rápida por WhatsApp y el perfume dura todo el día.', 3),
  ('Diego P.',  4, 'Segunda vez que compro, siempre llega bien empacado.', 4)
on conflict do nothing;
