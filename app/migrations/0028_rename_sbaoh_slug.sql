-- The SBAOH P302 power station went live at
--   /p/https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image
-- because a Temu photo address was pasted into the admin's "Web address" box.
-- Move it to a readable address once, carry every row that points at it, and
-- leave a 301 behind so Google and any saved link land on the new page.
--
-- Every step is guarded, so running this twice, or on a database where the
-- product was never created, changes nothing.

-- 1. The product itself, only if the new address is free.
UPDATE products
SET slug = 'sbaoh-p302-300w-portable-power-station'
WHERE slug = 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

-- 2. Everything that refers to it by address. Run only once the product has
--    actually moved, so a half-applied rename cannot orphan its photos.
UPDATE OR IGNORE product_images SET product_slug = 'sbaoh-p302-300w-portable-power-station'
WHERE product_slug = 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image'
  AND EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

UPDATE OR IGNORE cart_items SET product_slug = 'sbaoh-p302-300w-portable-power-station'
WHERE product_slug = 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image'
  AND EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

UPDATE order_items SET product_slug = 'sbaoh-p302-300w-portable-power-station'
WHERE product_slug = 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image'
  AND EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

UPDATE OR IGNORE reviews SET product_slug = 'sbaoh-p302-300w-portable-power-station'
WHERE product_slug = 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image'
  AND EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

-- Add-on drop-downs on other products list their choices by address.
UPDATE products
SET options = replace(options, 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image', 'sbaoh-p302-300w-portable-power-station')
-- instr(), not LIKE: D1 refuses a LIKE pattern this long ("pattern too complex").
WHERE instr(options, 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image') > 0
  AND EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

-- 3. The old address forwards to the new one (301).
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason)
SELECT 'https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image',
       '/p/sbaoh-p302-300w-portable-power-station',
       'Renamed: address was made from a pasted Temu photo link'
WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'sbaoh-p302-300w-portable-power-station');

-- Any older redirect that pointed at the old address now points straight here.
UPDATE product_redirects
SET to_path = '/p/sbaoh-p302-300w-portable-power-station'
WHERE to_path = '/p/https-img-kwcdn-com-product-fancy-042a99d3-1e35-4c8a-9c83-8ac003331806-jpg-image';
