-- Starter open briefs so vendor accounts can immediately browse multiple job types.

insert into public.briefs (id, buyer_id, title, category_id, raw_text, summary, budget_realistic, budget_note, status) values
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', null, 'Custom walnut storage bench', 'furniture', 'Need a walnut bench with hidden shoe storage for my entryway, around 1.4m wide.', 'Build a compact walnut-look entry bench with hidden shoe storage, soft-close access, and delivery in Singapore.', true, 'Budget target around S$850.', 'bidding'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', null, 'Paint a 3-room HDB flat', 'painting', 'Paint living room and two bedrooms, warm white, minor patching needed.', 'Repaint a 3-room HDB interior in warm white with light wall patching before painting.', true, 'Budget target around S$1,200.', 'bidding'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', null, 'Prototype 20 plastic enclosures', 'printing', 'Need 20 small electronics enclosures printed in black PLA from STL files.', '3D print 20 black PLA electronics enclosures from supplied STL files and clean up rough edges.', true, 'Budget target around S$280.', 'bidding'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', null, 'Company polo embroidery', 'apparel', 'Need 35 navy polo shirts embroidered with a small chest logo.', 'Supply or embroider 35 navy polo shirts with a small chest logo for a company event.', true, 'Budget target around S$700.', 'bidding')
on conflict (id) do update set
  title = excluded.title,
  category_id = excluded.category_id,
  raw_text = excluded.raw_text,
  summary = excluded.summary,
  budget_realistic = excluded.budget_realistic,
  budget_note = excluded.budget_note,
  status = excluded.status;

delete from public.brief_fields
where brief_id in (
  '0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10',
  '2d26f850-7b52-4f31-bf18-fd9f57c5c12d',
  '6cce779e-d967-4a07-a7d8-35f8a479755c',
  'db837c3d-a3c7-4f46-a2ac-993be922711f'
);

insert into public.brief_fields (brief_id, field_key, label, emoji, value) values
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'size', 'Size', 'measure', '1.4m wide'),
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'material', 'Material', 'wood', 'Walnut look'),
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'delivery', 'Delivery', 'truck', 'Singapore'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'rooms', 'Rooms', 'home', 'Living room and two bedrooms'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'paint', 'Paint', 'paint', 'Warm white'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'prep', 'Prep', 'tool', 'Minor patching'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'quantity', 'Quantity', 'box', '20 pieces'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'material', 'Material', 'print', 'Black PLA'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'files', 'Files', 'file', 'STL supplied'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'quantity', 'Quantity', 'shirt', '35 polos'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'color', 'Color', 'swatch', 'Navy'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'logo', 'Logo', 'thread', 'Small chest embroidery');
