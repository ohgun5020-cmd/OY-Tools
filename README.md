# PIGMA Landing

Figma design-based landing page for the PIGMA plugin concept.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- lucide-react icons

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

The app uses server routes for auth and billing. On Railway, attach a Volume to the app service for the SQLite auth DB.

## Lemon Squeezy Billing

Create subscription variants for Basic and Pro, then set these variables in Railway:

```bash
NEXT_PUBLIC_APP_URL=https://oy-tools-production.up.railway.app
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
LEMON_SQUEEZY_STORE_ID=...
LEMON_SQUEEZY_BASIC_VARIANT_ID=...
LEMON_SQUEEZY_PRO_VARIANT_ID=...
```

Add a Lemon Squeezy webhook endpoint:

```text
https://oy-tools-production.up.railway.app/api/webhooks/lemonsqueezy
```

Subscribe it to:

- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_expired`
