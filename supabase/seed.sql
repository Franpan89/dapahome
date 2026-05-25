-- Datos de muestra para desarrollo
-- Ejecuta DESPUÉS de 0001_init.sql

insert into public.categories (slug, name, description, sort_order) values
  ('iluminacion', 'Iluminación', 'Lámparas colgantes, de mesa, apliques y LED.', 10),
  ('decoracion', 'Decoración', 'Maceteros, jarrones, centros de mesa y objeto decorativo.', 20),
  ('domotica', 'Domótica', 'Cerraduras, switches y dispositivos compatibles con Alexa y Google Home.', 30),
  ('mobiliario', 'Mobiliario', 'Piezas seleccionadas para interior y exterior.', 40)
on conflict (slug) do nothing;

with c as (select id, slug from public.categories)
insert into public.products (slug, name, description, category_id, base_price, status, featured)
select * from (values
  ('lampara-aria', 'Lámpara Colgante Aria', 'Lámpara colgante de líneas suaves en latón cepillado. Acabado mate que difunde luz cálida.', (select id from c where slug='iluminacion'), 89.00, 'active', true),
  ('macetero-luna', 'Macetero Cerámica Luna', 'Cerámica artesanal con esmalte craquelado. Tres tamaños disponibles.', (select id from c where slug='decoracion'), 34.00, 'active', true),
  ('cerradura-nova', 'Cerradura Inteligente Nova', 'Apertura biométrica, Wi-Fi y compatible con Alexa.', (select id from c where slug='domotica'), 219.00, 'active', true),
  ('mesa-orbe', 'Mesa Auxiliar Orbe', 'Mesa redonda en roble macizo con base de hierro forjado.', (select id from c where slug='mobiliario'), 189.00, 'active', false),
  ('aplique-sol', 'Aplique de Pared Sol', 'Aplique direccional con brazo articulado.', (select id from c where slug='iluminacion'), 64.00, 'active', false),
  ('jarrón-onda', 'Jarrón Onda', 'Vidrio soplado a mano con textura ondulada.', (select id from c where slug='decoracion'), 48.00, 'active', false)
) as v(slug, name, description, category_id, base_price, status, featured)
on conflict (slug) do nothing;

-- Variantes ejemplo
with p as (select id, slug from public.products)
insert into public.product_variants (product_id, name, options, sku, price_override, sort_order)
select * from (values
  ((select id from p where slug='macetero-luna'), 'Pequeño', '{"size":"S"}'::jsonb, 'LUNA-S', 24.00, 1),
  ((select id from p where slug='macetero-luna'), 'Mediano', '{"size":"M"}'::jsonb, 'LUNA-M', 34.00, 2),
  ((select id from p where slug='macetero-luna'), 'Grande', '{"size":"L"}'::jsonb, 'LUNA-L', 44.00, 3),
  ((select id from p where slug='lampara-aria'), 'Latón', '{"color":"laton"}'::jsonb, 'ARIA-LT', null, 1),
  ((select id from p where slug='lampara-aria'), 'Negro mate', '{"color":"negro"}'::jsonb, 'ARIA-NG', null, 2)
) as v(product_id, name, options, sku, price_override, sort_order);

-- Imágenes placeholder (Unsplash) — reemplaza por archivos reales en Storage
with p as (select id, slug from public.products)
insert into public.product_images (product_id, storage_path, alt, sort_order, is_primary)
select * from (values
  ((select id from p where slug='lampara-aria'),    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200', 'Lámpara colgante Aria sobre comedor de madera', 1, true),
  ((select id from p where slug='lampara-aria'),    'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=1200', 'Detalle del acabado de la lámpara Aria', 2, false),
  ((select id from p where slug='macetero-luna'),   'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200', 'Macetero Luna con planta tropical', 1, true),
  ((select id from p where slug='cerradura-nova'),  'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200', 'Cerradura inteligente Nova instalada en puerta moderna', 1, true),
  ((select id from p where slug='mesa-orbe'),       'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200', 'Mesa auxiliar Orbe en sala minimalista', 1, true),
  ((select id from p where slug='aplique-sol'),     'https://images.unsplash.com/photo-1565636192335-aff7a59ee1d0?w=1200', 'Aplique de pared Sol iluminando una librería', 1, true),
  ((select id from p where slug='jarrón-onda'),     'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200', 'Jarrón Onda de vidrio soplado', 1, true)
) as v(product_id, storage_path, alt, sort_order, is_primary);
