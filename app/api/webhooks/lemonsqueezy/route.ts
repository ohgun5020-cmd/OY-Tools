import { createHmac, timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import { syncBillingSubscription } from "@/lib/auth"
import { getPlanForVariantId } from "@/lib/lemonsqueezy"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type LemonSqueezyWebhook = {
  meta?: {
    event_name?: string
    custom_data?: {
      user_id?: string
      plan?: string
    }
  }
  data?: {
    id?: string
    attributes?: {
      customer_id?: number | string | null
      variant_id?: number | string | null
      status?: string
      renews_at?: string | null
      ends_at?: string | null
      urls?: {
        customer_portal?: string | null
        update_payment_method?: string | null
      }
    }
  }
}

function verifySignature(body: string, signature: string, secret: string) {
  const digest = createHmac("sha256", secret).update(body).digest("hex")
  const digestBuffer = Buffer.from(digest, "hex")
  const signatureBuffer = Buffer.from(signature, "hex")

  return digestBuffer.length === signatureBuffer.length && timingSafeEqual(digestBuffer, signatureBuffer)
}

export async function POST(request: Request) {
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "LEMON_SQUEEZY_WEBHOOK_SECRET is not configured." }, { status: 500 })
  }

  const signature = request.headers.get("x-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing Lemon Squeezy signature." }, { status: 400 })
  }

  const body = await request.text()
  if (!verifySignature(body, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Lemon Squeezy webhook signature." }, { status: 400 })
  }

  const payload = JSON.parse(body) as LemonSqueezyWebhook
  const eventName = payload.meta?.event_name

  if (
    eventName === "subscription_created" ||
    eventName === "subscription_updated" ||
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    const attributes = payload.data?.attributes
    const variantId = attributes?.variant_id ? String(attributes.variant_id) : null
    const status = attributes?.status || (eventName === "subscription_expired" ? "expired" : "inactive")

    syncBillingSubscription({
      userId: payload.meta?.custom_data?.user_id || null,
      customerId: attributes?.customer_id ? String(attributes.customer_id) : null,
      subscriptionId: payload.data?.id || null,
      variantId,
      portalUrl: attributes?.urls?.customer_portal || attributes?.urls?.update_payment_method || null,
      status,
      plan: getPlanForVariantId(variantId),
      renewsAt: attributes?.renews_at || attributes?.ends_at || null,
    })
  }

  return NextResponse.json({ received: true })
}
