-- Add GIF display fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gif_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS show_gif_on_home BOOLEAN DEFAULT FALSE;
