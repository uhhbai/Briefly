-- Briefly — catalog seed (reference data shipped with the app).
-- Idempotent: safe to re-run. Mirrors src/lib/config.ts + src/lib/catalog.ts.
-- Image URLs follow img(id) = images.unsplash.com/photo-<id>?w=800&q=80&auto=format&fit=crop

insert into public.categories (id, label, emoji, example, gradient_from, gradient_to, image, sort_order) values
  ('furniture',  'Furniture & Carpentry',      '🪑', 'A walnut coffee table for a 1.8m wall, hidden charging, under S$800', '#6366F1', '#8B5CF6', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80&auto=format&fit=crop', 1),
  ('painting',   'Painting & Home Services',   '🎨', 'Paint my 3-room HDF flat, neutral colours, done within 2 weeks',     '#F59E0B', '#EF4444', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80&auto=format&fit=crop', 2),
  ('renovation', 'Renovation & Built-ins',     '🔨', 'Build a fitted wardrobe 2.4m wide with soft-close doors',            '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80&auto=format&fit=crop', 3),
  ('printing',   '3D Printing & Prototyping',  '🖨️', 'Print 20 PLA enclosures for a small electronics gadget',             '#10B981', '#059669', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop', 4),
  ('apparel',    'Apparel & Custom Goods',     '🧵', '30 embroidered polo shirts with our company logo',                  '#EC4899', '#BE185D', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop', 5),
  ('other',      'Something else',             '✨', 'Describe anything you want made or done',                            '#64748B', '#475569', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop', 6)
on conflict (id) do nothing;

insert into public.vendors (id, name, avatar, category_id, tagline, rating, review_count, jobs_done, verified, price_from, location, gradient_from, gradient_to, image) values
  ('v_tan',       'Tan Woodworks',       '🪚', 'furniture',  'Heirloom-grade solid wood furniture, made to measure.', 4.9, 213, 340, true,  280, 'Woodlands',  '#6366F1', '#8B5CF6', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&auto=format&fit=crop'),
  ('v_kampung',   'KampungCraft Studio', '🛠️', 'furniture',  'Scandinavian-inspired pieces for small homes.',         4.7,  88, 120, true,  180, 'Tampines',   '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop'),
  ('v_bayu',      'Bayu Finishings',     '🎨', 'painting',   'Spotless interior & exterior painting, fast turnaround.', 4.6, 142, 410, true,  350, 'Jurong',     '#F59E0B', '#EF4444', 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800&q=80&auto=format&fit=crop'),
  ('v_freshcoat', 'FreshCoat SG',        '🖌️', 'painting',   'Eco-friendly paints, weekend slots available.',         4.8,  96, 205, false, 300, 'Bishan',     '#F97316', '#DB2777', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80&auto=format&fit=crop'),
  ('v_built',     'BuiltRight Interiors','🔨', 'renovation', 'Custom built-ins, wardrobes & feature walls.',          4.7, 174, 260, true,  900, 'Ang Mo Kio', '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80&auto=format&fit=crop'),
  ('v_maker',     'Maker Lab SG',        '⚙️', 'printing',   'Rapid 3D printing & prototyping, PLA / ABS / resin.',   4.8, 156, 520, true,   40, 'one-north',  '#10B981', '#059669', 'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=800&q=80&auto=format&fit=crop'),
  ('v_precision', 'PrecisionPrint Co.',  '🖨️', 'printing',   'Engineering-grade prints with tight tolerances.',       4.6, 102, 300, true,   60, 'Kallang',    '#14B8A6', '#0D9488', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80&auto=format&fit=crop'),
  ('v_thread',    'ThreadWorks',         '🧵', 'apparel',    'Custom embroidery & printed apparel, bulk friendly.',   4.5,  64, 180, false,  12, 'Geylang',    '#EC4899', '#BE185D', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80&auto=format&fit=crop')
on conflict (id) do nothing;

insert into public.services (id, title, category_id, vendor_id, emoji, price_from, rating, review_count, eta_days, gradient_from, gradient_to, image) values
  ('s_coffee',    'Custom solid-wood coffee table',  'furniture',  'v_tan',       '🪑',  480, 4.9, 96, 18, '#6366F1', '#8B5CF6', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80&auto=format&fit=crop'),
  ('s_shelf',     'Floating shelves & bookcase',     'furniture',  'v_kampung',   '📚',  220, 4.7, 41, 10, '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80&auto=format&fit=crop'),
  ('s_flat',      'Full HDB flat repaint',           'painting',   'v_bayu',      '🏠',  680, 4.6, 120, 5, '#F59E0B', '#EF4444', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80&auto=format&fit=crop'),
  ('s_accent',    'Feature / accent wall',           'painting',   'v_freshcoat', '🎨',  180, 4.8, 52,  2, '#F97316', '#DB2777', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop'),
  ('s_wardrobe',  'Fitted wardrobe with soft-close', 'renovation', 'v_built',     '🚪', 1200, 4.7, 88, 21, '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80&auto=format&fit=crop'),
  ('s_prototype', '3D-printed prototype batch',      'printing',   'v_maker',     '🧩',   40, 4.8, 73,  4, '#10B981', '#059669', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop'),
  ('s_enclosure', 'Custom electronics enclosure',    'printing',   'v_precision', '📦',   60, 4.6, 39,  6, '#14B8A6', '#0D9488', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&auto=format&fit=crop'),
  ('s_polo',      'Embroidered company polos',       'apparel',    'v_thread',    '👕',   12, 4.5, 28,  9, '#EC4899', '#BE185D', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop')
on conflict (id) do nothing;
