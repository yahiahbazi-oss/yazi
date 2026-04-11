# YAZI — Luxury Clothing E-Commerce

Premium COD (Cash on Delivery) e-commerce platform for Tunisia.

## Quick Start

### 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`, then click **Run**
4. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase keys and admin password.

### 3. Install & Run

```bash
npm install
npm run dev
```

- Customer store: [http://localhost:3000](http://localhost:3000)  
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all `.env.local` variables in Vercel → Settings → Environment Variables.
