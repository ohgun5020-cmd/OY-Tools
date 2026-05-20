# OY Tools

OY Tools is a private mini SaaS workspace for personal operations and automation tools.

The first product is **OY Panel**, a private SMM order management dashboard. It connects to an external SMM provider API from the server only, so provider keys never ship to the browser.

## MVP Scope

- Single-admin login
- Server-side SMM API bridge
- Provider balance check
- Service catalog sync
- New order creation
- Order history storage
- One-click order status refresh
- Service favorite/enabled controls
- Basic internal pricing settings

Excluded from the first version:

- Public signup
- Customer checkout
- Reseller flows
- Public marketing pages
- Complex roles and permissions

## Stack

- Next.js App Router
- Tailwind CSS and shadcn/ui-style components
- Railway Postgres or Supabase for persistent storage
- Railway for deployment

Without SMM and database environment variables, the app runs in local demo mode with in-memory sample data.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Default local fallback credentials:

- Email: `admin@oy.tools`
- Password: `oy-admin`

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `AUTH_SECRET` before deployment.

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `SMM_API_URL`
- `SMM_API_KEY`
- `SMM_CURRENCY`
- `DATABASE_URL` for Railway Postgres
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Database

Recommended Railway setup: add a PostgreSQL service to the same project, then connect its `DATABASE_URL` variable to the OY-Tools service. The app creates the required tables automatically at runtime.

Supabase is also supported. Run `supabase/schema.sql` in the Supabase SQL editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-side Railway variables.

## GitHub

Suggested remote:

```bash
git remote add origin git@github.com:ohgun5020-cmd/OY-Tools.git
git branch -M main
git push -u origin main
```
