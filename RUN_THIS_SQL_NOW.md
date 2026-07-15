# 🚨 URGENT: RUN THIS SQL IN SUPABASE NOW

## Your products are not showing because the database migration hasn't been run yet!

### Step 1: Go to Supabase SQL Editor
Open: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

### Step 2: Copy and paste this ENTIRE SQL script:

```sql
-- Migration V9: Multi-Country Product Support

-- Add multi-country fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_countries JSONB DEFAULT '["TN"]'::jsonb,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_fees JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN products.target_countries IS 'Array of ISO country codes where this product is available';
COMMENT ON COLUMN products.prices IS 'Multi-currency pricing object';
COMMENT ON COLUMN products.delivery_fees IS 'Delivery fees per country';

-- Create index for country filtering
CREATE INDEX IF NOT EXISTS idx_products_target_countries ON products USING GIN (target_countries);

-- Migrate existing products to Tunisia with current prices
UPDATE products
SET 
  target_countries = '["TN"]'::jsonb,
  prices = jsonb_build_object(
    'TN', jsonb_build_object(
      'price', COALESCE(price, 0),
      'currency', 'TND'
    )
  ),
  delivery_fees = CASE 
    WHEN delivery_price IS NOT NULL THEN jsonb_build_object('TN', delivery_price)
    ELSE jsonb_build_object('TN', 8)
  END
WHERE target_countries IS NULL OR target_countries = '[]'::jsonb;
```

### Step 3: Click RUN (or press Ctrl+Enter)

### Step 4: Refresh your website

Your products will appear immediately after running this migration!

---

## What this does:
- Adds 3 new columns to your products table for multi-country support
- Sets all existing products to be available in Tunisia (TN)
- Migrates existing prices to the new multi-country format
- Creates an index for fast country-based filtering

## Status: READY TO RUN ✅
This migration is safe and will not delete any data.
