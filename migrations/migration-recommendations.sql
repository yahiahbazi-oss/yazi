-- Add recommended_product_ids column to products
-- Run this in Supabase SQL Editor

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS recommended_product_ids text[] DEFAULT '{}';
