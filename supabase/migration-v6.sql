-- Migration v6: Collections, site settings, EU sizes, collection_slugs on products

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '🏷️',
  color TEXT DEFAULT '#18181b',
  text_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add collection_slugs array to products (stores slugs of associated collections)
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_slugs TEXT[] DEFAULT '{}';

-- Site settings table (key-value store for dynamic configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default hero video URL (edit in Admin > Paramètres)
INSERT INTO site_settings (key, value)
VALUES ('hero_video_url', 'https://res.cloudinary.com/dxoje33mm/video/upload/v1759755548/wc_s1ovwb.webm')
ON CONFLICT (key) DO NOTHING;
