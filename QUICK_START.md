# ✅ QUICK START GUIDE

## 🚀 What Just Happened

I've completed all your requests:

1. ✅ **Home page design** → Restored to previous design you liked
2. ✅ **Added 15+ new countries** → All West Europe, Scandinavia, Australia
3. ✅ **Migration instructions** → Complete step-by-step guide
4. ✅ **Migration v6 requirement** → Explained what it does and how to run it

---

## 🔥 DO THIS NOW (2 minutes)

### Step 1: Run Migrations in Supabase

1. Go to [https://supabase.com](https://supabase.com) → Your project → **SQL Editor**

2. **Run Migration V6** (copy-paste this):

```sql
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

ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_slugs TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value)
VALUES ('hero_video_url', 'https://res.cloudinary.com/dxoje33mm/video/upload/v1759755548/wc_s1ovwb.webm')
ON CONFLICT (key) DO NOTHING;
```

Click **Run** ✅

3. **Run Migration V9** (copy-paste this):

```sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_countries JSONB DEFAULT '["TN"]'::jsonb,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_fees JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_target_countries ON products USING GIN (target_countries);

UPDATE products
SET 
  target_countries = '["TN"]'::jsonb,
  prices = jsonb_build_object('TN', jsonb_build_object('price', price, 'currency', 'TND')),
  delivery_fees = CASE 
    WHEN delivery_price IS NOT NULL THEN jsonb_build_object('TN', delivery_price)
    ELSE jsonb_build_object('TN', 8)
  END
WHERE target_countries IS NULL OR target_countries = '[]'::jsonb;
```

Click **Run** ✅

**Done!** Your database is now ready.

---

## 🌍 NEW COUNTRIES AVAILABLE (35 total)

### **North Africa** (5)
🇹🇳 Tunisia • 🇩🇿 Algeria • 🇲🇦 Morocco • 🇱🇾 Libya • 🇪🇬 Egypt

### **Western Europe - Eurozone** (11)
🇫🇷 France • 🇩🇪 Germany • 🇮🇹 Italy • 🇪🇸 Spain • 🇧🇪 Belgium  
🇳🇱 Netherlands • 🇵🇹 Portugal • 🇦🇹 Austria • 🇮🇪 Ireland • 🇱🇺 Luxembourg • 🇬🇷 Greece

### **Western Europe - Non-Euro** (2)
🇬🇧 United Kingdom (£) • 🇨🇭 Switzerland (CHF)

### **Scandinavia** (5)
🇸🇪 Sweden (SEK) • 🇳🇴 Norway (NOK) • 🇩🇰 Denmark (DKK) • 🇫🇮 Finland (€) • 🇮🇸 Iceland (ISK)

### **Oceania** (2)
🇦🇺 Australia (AUD) • 🇳🇿 New Zealand (NZD)

### **Middle East** (4)
🇸🇦 Saudi Arabia • 🇦🇪 UAE • 🇶🇦 Qatar • 🇰🇼 Kuwait

### **North America** (2)
🇺🇸 United States ($) • 🇨🇦 Canada (CAD)

---

## 🎯 How to Create Multi-Country Product

**Example: Scandinavian Football Jersey**

1. Go to `/admin/products` → Add Product
2. Fill in name, description, images
3. Scroll to **"🌍 Target Countries & Pricing"** (blue box)
4. Click flags to select countries:
   - 🇸🇪 SE (Sweden)
   - 🇳🇴 NO (Norway)
   - 🇩🇰 DK (Denmark)
   - 🇫🇮 FI (Finland)
5. Set prices per country:
   ```
   Sweden:  250 SEK
   Norway:  300 NOK
   Denmark: 200 DKK
   Finland: 30 EUR
   ```
6. Save!

**What happens:**
- Swedish visitor → Sees product for 250 SEK
- Norwegian visitor → Sees product for 300 NOK
- Tunisian visitor → Doesn't see this product (not targeted to TN)

---

## 📚 Full Documentation

- **Migration Guide**: `HOW_TO_RUN_MIGRATIONS.md`
- **Multi-Country Guide**: `MULTI_COUNTRY_GUIDE.md`

---

## 🎨 Home Page

✅ **Restored to your previous design** (simple, clean version)
❌ **Removed the new modern design** (gradient-heavy version you didn't like)

---

## ⚡ Next Steps

1. ✅ Run both migrations (V6 and V9) in Supabase
2. ✅ Refresh your website
3. ✅ Create your first multi-country product
4. ✅ Test with VPN or browser dev tools

**Total time:** 5 minutes to be fully operational!

---

## 🆘 Problems?

**Migrations fail?** → Read `HOW_TO_RUN_MIGRATIONS.md` (troubleshooting section)  
**Products not showing?** → Make sure you selected at least one country  
**Prices wrong?** → Check currency conversion in admin  

Everything is pushed to GitHub (commit `54e281d`) 🎉
