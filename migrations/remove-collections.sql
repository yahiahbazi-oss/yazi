-- Run this in your Supabase SQL Editor to fully remove collections from the database.

-- 1. Drop the collections table
DROP TABLE IF EXISTS collections;

-- 2. Remove the collection_slugs column from the products table
ALTER TABLE products
  DROP COLUMN IF EXISTS collection_slugs;
