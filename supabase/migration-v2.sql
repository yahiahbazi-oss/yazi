-- ============================================
-- YAZI E-Commerce Schema Migration v2
-- Adds: categories table, gender field, color variants
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- ADD COLUMNS TO PRODUCTS
-- ============================================

-- Gender column: men, women, or unisex
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'));

-- Color variants: JSONB structure like:
-- { "#000000": { "name": "Black", "images": ["url1", "url2"] }, "#FFFFFF": { "name": "White", "images": ["url3"] } }
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '{}';

-- Category ID foreign key
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Index for category_id
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);

-- ============================================
-- SEED SOME CATEGORIES
-- ============================================
INSERT INTO categories (name) VALUES
  ('T-Shirts'),
  ('Hoodies'),
  ('Jackets'),
  ('Pants'),
  ('Shirts'),
  ('Accessories')
ON CONFLICT (name) DO NOTHING;
