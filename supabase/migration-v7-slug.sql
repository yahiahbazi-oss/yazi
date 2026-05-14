-- Migration v7: Add slug column to products for SEO-friendly URLs
-- Run this in your Supabase SQL Editor

-- Add slug column (nullable so existing products aren't broken)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unique index (partial: only when slug is set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

-- Backfill slugs for existing products using their name
-- (generates "zaalouni-t-shirt", and appends -2, -3 for duplicates)
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  candidate TEXT;
  counter INT;
BEGIN
  FOR rec IN SELECT id, name FROM products WHERE slug IS NULL ORDER BY created_at LOOP
    base_slug := regexp_replace(
      regexp_replace(
        lower(trim(rec.name)),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    );
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    candidate := base_slug;
    counter := 2;
    
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = candidate) LOOP
      candidate := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    UPDATE products SET slug = candidate WHERE id = rec.id;
  END LOOP;
END $$;
