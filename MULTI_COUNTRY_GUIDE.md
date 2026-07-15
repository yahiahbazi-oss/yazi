# Multi-Country E-Commerce System

Your YAZI website now supports selling products to multiple countries with automatic country detection and localized pricing!

## 🌍 Features

- **Automatic Country Detection** - Detects user's location from IP address
- **Multi-Country Products** - Target specific countries per product
- **Localized Pricing** - Set prices in local currency (EUR, USD, TND, etc.)
- **Country-Specific Delivery Fees** - Custom delivery fees per country
- **Smart Filtering** - Only show products available in user's country

## 📋 Setup Instructions

### 1. Run Database Migration

Go to your Supabase SQL Editor and run:

```sql
-- Migration V9: Multi-Country Product Support
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_countries JSONB DEFAULT '["TN"]'::jsonb,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_fees JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_target_countries ON products USING GIN (target_countries);

-- Migrate existing products
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
```

Or run the full migration file: `supabase/migration-v9-multi-country.sql`

### 2. All Existing Products Migrated

All your current products are automatically set to Tunisia (TN) with existing prices.

## 🎯 How to Use

### Creating a Multi-Country Product

Example: France National Team T-Shirt

1. **Go to Admin → Products → Add Product**
2. **Fill in basic info** (name, description, etc.)
3. **Scroll to "Target Countries & Pricing" section** (blue box)
4. **Select Countries**:
   - Click on country flags to select (e.g., 🇫🇷 FR, 🇹🇳 TN)
   - Selected countries turn blue
   - You can select one or multiple countries

5. **Set Prices Per Country**:
   ```
   🇫🇷 France
   ├─ Price: 25.00 €
   └─ Delivery Fee: 5.00 €

   🇹🇳 Tunisia  
   ├─ Price: 80.00 TND
   └─ Delivery Fee: 8.00 TND
   ```

6. **Save Product**

### How It Works for Customers

**Customer from France:**
- Website detects: France 🇫🇷
- Shows: Only products targeted to France
- Prices: In EUR (€)
- Delivery fees: In EUR

**Customer from Tunisia:**
- Website detects: Tunisia 🇹🇳
- Shows: Products targeted to Tunisia
- Prices: In TND
- Delivery fees: In TND

**Customer from Germany (no products):**
- Website detects: Germany 🇩🇪
- Shows: Empty catalog (or can show TN products as fallback)

## 🌐 Supported Countries

### North Africa
- 🇹🇳 Tunisia (TND)
- 🇩🇿 Algeria (DZD)
- 🇲🇦 Morocco (MAD)
- 🇱🇾 Libya (LYD)
- 🇪🇬 Egypt (EGP)

### Europe (Eurozone)
- 🇫🇷 France (EUR)
- 🇩🇪 Germany (EUR)
- 🇮🇹 Italy (EUR)
- 🇪🇸 Spain (EUR)
- 🇧🇪 Belgium (EUR)
- 🇳🇱 Netherlands (EUR)

### Europe (Non-Euro)
- 🇬🇧 United Kingdom (GBP)
- 🇨🇭 Switzerland (CHF)

### Middle East
- 🇸🇦 Saudi Arabia (SAR)
- 🇦🇪 UAE (AED)
- 🇶🇦 Qatar (QAR)
- 🇰🇼 Kuwait (KWD)

### North America
- 🇺🇸 United States (USD)
- 🇨🇦 Canada (CAD)

## 📊 Example Use Cases

### 1. National Team Jerseys
```
Product: France National Team T-Shirt
Countries: 🇫🇷 FR only
Price FR: 25.00 EUR
Delivery FR: 5.00 EUR
```

### 2. Regional Collection
```
Product: North Africa Traditional Dress
Countries: 🇹🇳 TN, 🇩🇿 DZ, 🇲🇦 MA
Price TN: 120.00 TND
Price DZ: 8,500 DZD  
Price MA: 650 MAD
```

### 3. European Expansion
```
Product: Designer Hoodie
Countries: 🇫🇷 FR, 🇩🇪 DE, 🇮🇹 IT, 🇪🇸 ES, 🇧🇪 BE
Price (All): 45.00 EUR
Delivery: 5.00 EUR
```

### 4. Worldwide Product
```
Product: Basic T-Shirt
Countries: Select all 20 countries
Set different prices per market
```

## 🔧 Technical Details

### Country Detection Methods

1. **Vercel Geo Headers** (instant, priority)
   - Uses `x-vercel-ip-country` header
   - Automatic on Vercel deployment

2. **IP Geolocation API** (fallback)
   - Uses ipapi.co (free: 1000 requests/day)
   - Detects country from IP address

3. **LocalStorage** (user preference)
   - Saves user's selected country
   - Persists across sessions

### API Endpoints

**Get User Location:**
```bash
GET /api/geolocation
Response: { country: "FR", currency: "EUR", ip: "1.2.3.4" }
```

**Get Products for Country:**
```bash
GET /api/products?country=FR
Response: { products: [...], country: "FR" }
```

**Get All Products (Admin):**
```bash
GET /api/products?country=ALL
Response: { products: [...] }
```

### Database Schema

```sql
products:
  - target_countries: ["TN", "FR", "US"]  -- Array of ISO codes
  - prices: {                              -- Nested pricing object
      "TN": {"price": 25, "currency": "TND"},
      "FR": {"price": 15, "currency": "EUR"}
    }
  - delivery_fees: {                       -- Delivery per country
      "TN": 8,
      "FR": 5
    }
```

## 🎨 Admin UI Features

- **Visual Country Selector**: Click flags to select/deselect
- **Per-Country Pricing Form**: Automatically shows fields for selected countries
- **Currency Symbols**: Shows correct symbol for each currency (€, $, TND, etc.)
- **Validation**: Ensures at least one country is selected
- **Smart Defaults**: New countries initialize with base product price

## 🚀 Next Steps

1. ✅ Run the database migration
2. ✅ Create your first multi-country product
3. ✅ Test by changing your location (VPN or browser dev tools)
4. ✅ Monitor orders per country
5. ✅ Expand to new markets gradually

## 💡 Pro Tips

- **Start Small**: Begin with Tunisia + 1-2 neighboring countries
- **Test Prices**: Research local market prices for each country
- **Monitor Shipping**: Update delivery fees based on actual costs
- **Seasonal Products**: Use country targeting for seasonal items (e.g., winter coats for Europe, summer wear for Middle East)
- **Language**: Consider adding translations (future feature)

## 📱 User Experience

- Seamless auto-detection (no popups or annoying selectors)
- Fast loading (headers are instant)
- Mobile-friendly (works on all devices)
- Fallback gracefully (defaults to Tunisia if detection fails)

Your website is now ready for international expansion! 🌍✨
