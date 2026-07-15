-- Migration v9: Add international support
-- Add columns for multi-currency and regional pricing

-- Add currency and region support to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TND',
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2);

-- Add regional pricing to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_regions TEXT[] DEFAULT ARRAY['TN'];

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_regions ON products USING GIN (available_regions);

-- Example: Update existing products to have TND pricing
UPDATE products 
SET pricing = jsonb_build_object(
  'TND', jsonb_build_object('price', price, 'compare_price', compare_price, 'delivery_price', delivery_price),
  'EUR', jsonb_build_object('price', ROUND(price / 3.3, 2), 'compare_price', CASE WHEN compare_price IS NOT NULL THEN ROUND(compare_price / 3.3, 2) ELSE NULL END, 'delivery_price', 15),
  'USD', jsonb_build_object('price', ROUND(price / 3.1, 2), 'compare_price', CASE WHEN compare_price IS NOT NULL THEN ROUND(compare_price / 3.1, 2) ELSE NULL END, 'delivery_price', 15),
  'GBP', jsonb_build_object('price', ROUND(price / 3.8, 2), 'compare_price', CASE WHEN compare_price IS NOT NULL THEN ROUND(compare_price / 3.8, 2) ELSE NULL END, 'delivery_price', 15)
)
WHERE pricing = '{}';

-- Add site settings for international config
INSERT INTO site_settings (key, value)
VALUES 
  ('supported_currencies', '["TND","EUR","USD","GBP"]'),
  ('default_currency', 'TND'),
  ('exchange_rates', '{"TND":1,"EUR":3.3,"USD":3.1,"GBP":3.8}'),
  ('international_shipping', 'true')
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN orders.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN orders.exchange_rate IS 'Exchange rate used at time of order';
COMMENT ON COLUMN products.pricing IS 'Multi-currency pricing: {EUR: {price, compare_price, delivery_price}, USD: {...}}';
COMMENT ON COLUMN products.available_regions IS 'Country codes where product is available';
