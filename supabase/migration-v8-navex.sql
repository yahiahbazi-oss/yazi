-- Migration v8: Add Navex delivery tracking fields to orders

-- Add Navex tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS navex_tracking_code TEXT,
ADD COLUMN IF NOT EXISTS navex_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS navex_status TEXT,
ADD COLUMN IF NOT EXISTS navex_last_check TIMESTAMPTZ;

-- Create index on tracking code for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_navex_tracking ON orders(navex_tracking_code);

-- Add comment for documentation
COMMENT ON COLUMN orders.navex_tracking_code IS 'Navex delivery service tracking code';
COMMENT ON COLUMN orders.navex_sent_at IS 'Timestamp when order was sent to Navex';
COMMENT ON COLUMN orders.navex_status IS 'Latest delivery status from Navex (En attente, En cours, Livré, etc.)';
COMMENT ON COLUMN orders.navex_last_check IS 'Last time delivery status was checked';
