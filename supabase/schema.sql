-- ============================================
-- YAZI E-Commerce Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  images TEXT[] DEFAULT '{}',
  category TEXT,
  stock JSONB DEFAULT '{"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}',
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone2 TEXT,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  payment_received DECIMAL(10, 2) DEFAULT 0,
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read active products, service role can do everything
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access to products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Orders: Service role can do everything, anon can insert
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role full access to orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SAMPLE PRODUCTS (optional - delete in production)
-- ============================================
INSERT INTO products (name, description, price, category, stock, is_new, images) VALUES
  ('Classic Black Tee', 'Premium cotton essential in timeless black. Clean cut, perfect fit.', 89, 'T-Shirts', '{"S": 10, "M": 15, "L": 12, "XL": 8, "XXL": 5}', true, '{}'),
  ('Midnight Hoodie', 'Heavyweight French terry hoodie. Minimal branding, maximum comfort.', 189, 'Hoodies', '{"S": 8, "M": 12, "L": 10, "XL": 6, "XXL": 4}', true, '{}'),
  ('Signature Logo Tee', 'YAZI signature embroidered logo on premium fabric.', 99, 'T-Shirts', '{"S": 15, "M": 20, "L": 18, "XL": 10, "XXL": 5}', false, '{}'),
  ('Essential Joggers', 'Clean-line joggers in premium cotton blend. Tapered fit.', 149, 'Pants', '{"S": 10, "M": 14, "L": 12, "XL": 8, "XXL": 3}', true, '{}'),
  ('Oversized Crewneck', 'Relaxed fit crewneck in double-weight cotton.', 159, 'Sweatshirts', '{"S": 6, "M": 10, "L": 14, "XL": 8, "XXL": 4}', false, '{}'),
  ('Urban Jacket', 'Water-resistant minimal jacket. Sleek silhouette.', 249, 'Jackets', '{"S": 5, "M": 8, "L": 10, "XL": 6, "XXL": 3}', true, '{}'),
  ('Slim Cargo Pants', 'Modern cargo with hidden pockets. Stretch fabric.', 169, 'Pants', '{"S": 8, "M": 12, "L": 10, "XL": 6, "XXL": 4}', false, '{}'),
  ('Premium Polo', 'Piqué cotton polo with subtle YAZI detail.', 119, 'Polos', '{"S": 10, "M": 15, "L": 12, "XL": 8, "XXL": 5}', true, '{}'),
  ('Track Shorts', 'Lightweight performance shorts. Zippered pockets.', 109, 'Shorts', '{"S": 12, "M": 18, "L": 15, "XL": 10, "XXL": 5}', false, '{}');
