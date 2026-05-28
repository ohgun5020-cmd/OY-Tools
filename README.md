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

## Admin Plan Override

Signed-in admin emails can open `/admin` and manually set a user's plan by email. This works for Google accounts too because the user lookup is based on the verified email address.

Set admin emails in Railway:

```bash
PIGMA_ADMIN_EMAILS=ohgun5020@gmail.com
```

The owner email `ohgun5020@gmail.com` is always allowed, even when additional admin emails are configured.

Free users receive temporary Basic access for seven days by default. Adjust it with:

```bash
PIGMA_BASIC_TRIAL_DAYS=7
```

## Paddle Billing

Create Basic and Pro prices in Paddle, then set these variables in Railway:

```bash
NEXT_PUBLIC_APP_URL=https://oy-tools-production.up.railway.app
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
PADDLE_API_KEY=...
PADDLE_ENVIRONMENT=production
PADDLE_WEBHOOK_SECRET=...
PADDLE_BASIC_PRICE_ID=pri_01ksktfy8dsq6zjj4nq29hwz2x
PADDLE_PRO_PRICE_ID=pri_01ksktgy40nsef59aed9s4g24p
PADDLE_CUSTOMER_PORTAL_URL=...
```

Give the Paddle API key `customer_portal_session.write` permission so the dashboard can create authenticated customer portal links for payment method updates, invoices, and subscription cancellation.

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

## PIGMA Plugin Integration

The web app is the source of truth for account, billing, and plan state. The Figma plugin should only display a compact connection state and read the current plan through a plugin token.

- Users open `/plugin/connect` while logged in to create a plugin token.
- The plugin stores the server URL and token locally, then calls `/api/plugin/session` with `Authorization: Bearer <token>`.
- `/api/plugin/session` returns only the lightweight fields the plugin needs: name, email, plan, plan status, renewal date, avatar URL, and web links.
