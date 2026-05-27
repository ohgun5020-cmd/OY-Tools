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

## Paddle Billing

Create Basic and Pro prices in Paddle, then set these variables in Railway:

```bash
NEXT_PUBLIC_APP_URL=https://oy-tools-production.up.railway.app
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
PADDLE_ENVIRONMENT=production
PADDLE_WEBHOOK_SECRET=...
PADDLE_BASIC_PRICE_ID=pri_01ksktfy8dsq6zjj4nq29hwz2x
PADDLE_PRO_PRICE_ID=pri_01ksktgy40nsef59aed9s4g24p
PADDLE_CUSTOMER_PORTAL_URL=...
```

In Paddle > Checkout > Checkout settings, set the default payment link to your production domain:

```text
https://oy-tools-production.up.railway.app
```

Add a Paddle webhook endpoint:

```text
https://oy-tools-production.up.railway.app/api/webhooks/paddle
```

Subscribe it to:

- `subscription.created`
- `subscription.trialing`
- `subscription.activated`
- `subscription.updated`
- `subscription.past_due`
- `subscription.paused`
- `subscription.resumed`
- `subscription.canceled`
