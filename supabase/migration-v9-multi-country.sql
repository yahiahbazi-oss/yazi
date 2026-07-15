-- Migration V9: Multi-Country Product Support
-- Allows products to be targeted to specific countries with localized pricing

-- Add multi-country fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_countries JSONB DEFAULT '["TN"]'::jsonb,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_fees JSONB DEFAULT '{}'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN products.target_countries IS 'Array of ISO country codes where this product is available, e.g., ["TN", "FR", "US"]';
COMMENT ON COLUMN products.prices IS 'Multi-currency pricing object, e.g., {"TN": {"price": 25, "currency": "TND"}, "FR": {"price": 15, "currency": "EUR"}}';
COMMENT ON COLUMN products.delivery_fees IS 'Delivery fees per country, e.g., {"TN": 8, "FR": 5, "US": 10}';

-- Create index for country filtering (using GIN for JSONB array contains)
CREATE INDEX IF NOT EXISTS idx_products_target_countries ON products USING GIN (target_countries);

-- Migrate existing products to new structure
-- Set Tunisia as default country with existing price and delivery_price
UPDATE products
SET 
  target_countries = '["TN"]'::jsonb,
  prices = jsonb_build_object(
    'TN', jsonb_build_object(
      'price', price,
      'currency', 'TND'
    )
  ),
  delivery_fees = CASE 
    WHEN delivery_price IS NOT NULL THEN jsonb_build_object('TN', delivery_price)
    ELSE jsonb_build_object('TN', 8)
  END
WHERE target_countries IS NULL OR target_countries = '[]'::jsonb;

-- Note: Keep existing price and delivery_price columns for backward compatibility
-- They will serve as the base/default price for Tunisia
