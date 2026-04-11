-- Add delivery_price column to products
-- NULL means free delivery (Livraison gratuite), a number means fixed delivery fee
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_price DECIMAL(10, 2) DEFAULT NULL;
