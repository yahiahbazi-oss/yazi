# Navex Delivery Integration

This project integrates with [Navex](https://app.navex.tn/), a Tunisian delivery service, to manage order deliveries directly from the admin dashboard.

## Features

- **Send orders to Navex** with one click from admin dashboard
- **Track delivery status** in real-time
- **Automatic tracking code** storage
- **Delivery status updates** (En attente, En cours, Livré, etc.)
- **Driver information** display (name and phone)

## Setup

### 1. Get Your Navex API Tokens

Visit [https://app.navex.tn/](https://app.navex.tn/) and get your API tokens:
- **TOKEN d'ajout** (Create token) - for creating deliveries
- **TOKEN de Récupération** (Track token) - for tracking status
- **TOKEN de suppression** (Delete token) - for canceling deliveries

### 2. Add Environment Variables

Add these to your `.env.local`:

```env
NAVEX_TOKEN_CREATE=your-create-token
NAVEX_TOKEN_TRACK=your-track-token
NAVEX_TOKEN_DELETE=your-delete-token
```

### 3. Run Database Migration

Execute the migration in your Supabase SQL Editor:

```sql
-- Add Navex tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS navex_tracking_code TEXT,
ADD COLUMN IF NOT EXISTS navex_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS navex_status TEXT,
ADD COLUMN IF NOT EXISTS navex_last_check TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_navex_tracking ON orders(navex_tracking_code);
```

Or run the migration file: `supabase/migration-v8-navex.sql`

### 4. Add Default Delivery Fee Setting

In Supabase SQL Editor:

```sql
INSERT INTO site_settings (key, value)
VALUES ('default_delivery_fee', '8')
ON CONFLICT (key) DO UPDATE SET value = '8';
```

## Usage

### Admin Dashboard

1. **Go to Orders Page**: `/admin/orders`
2. **Click on an order** to view details
3. **Send to Navex**: Click "Envoyer à Navex" button
4. **Track Status**: Click "Actualiser le statut" to refresh delivery status

### API Endpoints

The integration provides these endpoints at `/api/navex`:

#### Create Delivery
```javascript
POST /api/navex
{
  "action": "create",
  "orderId": "order-uuid"
}
```

#### Track Single Delivery
```javascript
POST /api/navex
{
  "action": "track",
  "trackingCode": "123456789012"
}
```

#### Track Multiple Deliveries
```javascript
POST /api/navex
{
  "action": "track-multiple",
  "trackingCodes": ["123456789012", "987654321098"]
}
```

#### Get Pending Deliveries
```javascript
POST /api/navex
{
  "action": "pending"
}
```

#### Delete Delivery
```javascript
DELETE /api/navex?code=123456789012
```

## Delivery Status Values

- **En attente** - Waiting for pickup
- **En cours** - In transit
- **Livrer Paye** - Delivered and paid
- **Retourné** - Returned
- **Annulé** - Canceled

## Order Data Mapping

Yazi orders are automatically converted to Navex format:

| Yazi Field | Navex Field | Description |
|------------|-------------|-------------|
| total_amount | prix | Order total price |
| customer_name | nom | Customer name |
| governorate | gouvernerat | Governorate |
| address | adresse | Full address |
| phone | tel | Primary phone |
| phone2 | tel2 | Secondary phone |
| items | designation | Product list |
| items.quantity | nb_article | Number of articles |
| note | msg | Order notes |

## Troubleshooting

### Delivery not created
- Check that all required fields are filled in the order
- Verify API tokens are correct
- Check Supabase logs for errors

### Tracking status not updating
- Ensure tracking code is valid
- Check network connectivity
- Verify track token is correct

### Missing environment variables
- Copy `.env.local.example` to `.env.local`
- Fill in your Navex API tokens
- Restart your development server

## Support

For Navex API support, contact: [contact@navex.tn](mailto:contact@navex.tn)
