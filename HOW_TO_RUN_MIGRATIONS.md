# 📚 How to Run Database Migrations

## ⚠️ IMPORTANT: Run Migrations in Order

You need to run **TWO** migrations for your website to work properly:

### 1️⃣ Migration V6 (Collections & Settings)
### 2️⃣ Migration V9 (Multi-Country Products)

---

## 🔧 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor**

1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your **yazi** project
4. Click **SQL Editor** in the left sidebar (database icon)

---

### **Step 2: Run Migration V6**

**Copy and paste this SQL code:**

```sql
-- Migration v6: Collections, site settings, EU sizes, collection_slugs on products

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '🏷️',
  color TEXT DEFAULT '#18181b',
  text_color TEXT DEFAULT '#ffffff',
  image_url TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add collection_slugs array to products (stores slugs of associated collections)
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_slugs TEXT[] DEFAULT '{}';

-- Site settings table (key-value store for dynamic configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default hero video URL (edit in Admin > Paramètres)
INSERT INTO site_settings (key, value)
VALUES ('hero_video_url', 'https://res.cloudinary.com/dxoje33mm/video/upload/v1759755548/wc_s1ovwb.webm')
ON CONFLICT (key) DO NOTHING;
```

**Then click "Run" button** (or press `Ctrl+Enter`)

✅ You should see: "Success. No rows returned"

---

### **Step 3: Run Migration V9**

**Copy and paste this SQL code:**

```sql
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
```

**Then click "Run" button** (or press `Ctrl+Enter`)

✅ You should see: "Success. X rows returned" (where X = number of your products)

---

## 🎯 What These Migrations Do

### Migration V6 adds:
- **Collections table**: For grouping products (e.g., "Summer Collection", "New Arrivals")
- **Site settings table**: For configurable settings (hero video, delivery fees, etc.)
- **collection_slugs column**: Links products to collections

### Migration V9 adds:
- **target_countries column**: Countries where each product is available
- **prices column**: Multi-currency pricing per country
- **delivery_fees column**: Delivery fees per country
- **Automatic migration**: All existing products → Tunisia (TN) with current prices

---

## ✅ How to Verify Migrations Worked

### Check V6:
```sql
SELECT * FROM collections LIMIT 5;
SELECT * FROM site_settings;
```

### Check V9:
```sql
SELECT name, target_countries, prices, delivery_fees 
FROM products 
LIMIT 5;
```

You should see your products with Tunisia (TN) data.

---

## 🚨 Troubleshooting

### Error: "relation already exists"
✅ This is OK! It means the table already exists. The migration uses `IF NOT EXISTS`.

### Error: "column already exists"
✅ This is OK! It means the column already exists. The migration uses `IF NOT EXISTS`.

### Error: "permission denied"
❌ You need to be the project owner or have admin rights in Supabase.

### Products still show old data
1. Clear your browser cache
2. Restart your development server (`npm run dev`)
3. Check if migrations ran successfully (see verification above)

---

## 📝 Summary

1. ✅ Open Supabase SQL Editor
2. ✅ Run Migration V6 (collections & settings)
3. ✅ Run Migration V9 (multi-country)
4. ✅ Verify both migrations worked
5. ✅ Refresh your website

**Total time:** ~2 minutes

---

## 🆘 Need Help?

If migrations fail or you see errors:
1. Copy the error message
2. Check which migration failed (V6 or V9)
3. Try running them one at a time
4. Contact support if issues persist

All migration files are in: `supabase/migration-v*.sql`
