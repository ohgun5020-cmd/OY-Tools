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
- `/api/plugin/session` returns only the lightweight fields the plugin needs: name, email, plan, plan status, renewal date, avatar URL, entitlement flags, and web links.

## Plugin Notices

Release notes live in a small public JSON file on R2. Updating this JSON is enough for the plugin notice panel; the Figma plugin does not need to be republished. The plugin fetches the public JSON when the Settings notice panel opens or when the refresh button is pressed. R2 is configured with a short cache window, so updates normally appear after refresh or cache expiry.

Admins can manage the same JSON in three ways:

- Web admin: open `/admin` and use the Release notes editor.
- Plugin admin: connect an admin account in the plugin, then open Settings > Updates / Release Notes > Admin editor.
- Codex/manual: edit and upload a JSON file with the same schema.

Set these variables in Railway so `/api/admin/notices` can upload the JSON to R2:

```bash
PIGMA_NOTICE_PUBLIC_URL=https://pub-8e2f2ec9d22c4c97b52fe244b86bc4cf.r2.dev/notices/pigma-notices.json
PIGMA_NOTICE_OBJECT_KEY=notices/pigma-notices.json
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=pigma-assets
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
```

Notice payload shape:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-08T00:00:00.000Z",
  "defaultLocale": "en",
  "version": {
    "latest": "2.8.0",
    "minimumSupported": "2.8.0",
    "channel": "stable",
    "message": "Latest public build is available from the Figma Community listing.",
    "communityUrl": "https://www.figma.com/community/plugin/1645743599892655504"
  },
  "items": [
    {
      "id": "release-2026-06-08",
      "type": "release",
      "severity": "success",
      "title": "Pigma notices are live",
      "body": "Release notes can now be updated from the website, plugin, or Codex.",
      "bullets": ["No plugin republish required.", "Admin-only editing uses the web API."],
      "publishedAt": "2026-06-08T00:00:00.000Z",
      "visible": true
    }
  ]
}
```

## Plugin AI Proxy

The plugin should never fetch or store the server `OPENAI_API_KEY`. For server-funded AI, call `POST /api/plugin/ai` with the plugin token:

```json
{
  "instructions": "You are a concise design assistant.",
  "prompt": "Suggest three fixes for this Figma layer naming issue."
}
```

- Send `Authorization: Bearer <plugin token>`.
- Plugin AI is allowed only when `user.entitlement.serverAiEnabled` is `true` (Pro / $5 tier).
- Basic / $2 and free users receive `403` with `code: "ai_plan_required"`, even if a request includes a user OpenAI key.
- For Pro/admin requests, a user-provided key can be passed with `X-Pigma-OpenAI-Key`; that key is used first and is not stored.
- The response includes `text`, the raw OpenAI `response`, the selected `model`, and whether the `provider` was `server` or `user`.
- Vision tasks can send an OpenAI Responses-style `input` array with `input_text` and `input_image` content parts. The plugin uses this for Pro image text extraction.
