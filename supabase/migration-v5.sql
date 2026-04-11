-- Migration v5: Add big_size_price column for 3XL/4XL/5XL sizing
ALTER TABLE products ADD COLUMN IF NOT EXISTS big_size_price DECIMAL(10,2) DEFAULT NULL;
