import { NextResponse } from "next/server"

import { syncBillingSubscription } from "@/lib/auth"
import { getPlanForPriceId, isBillingPlan, verifyPaddleSignature } from "@/lib/paddle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PaddleWebhook = {
  event_type?: string
  data?: {
    id?: string
    customer_id?: string | null
    status?: string
    custom_data?: {
      user_id?: string
      plan?: string
    } | null
    items?: Array<{
      price?: {
        id?: string
      }
    }>
    current_billing_period?: {
      ends_at?: string | null
    } | null
    next_billed_at?: string | null
    scheduled_change?: {
      effective_at?: string | null
    } | null
    management_urls?: {
      update_payment_method?: string | null
      cancel?: string | null
    } | null
  }
}

function getSubscriptionPriceId(data: PaddleWebhook["data"]) {
  return data?.items?.find((item) => item.price?.id)?.price?.id || null
}

function getPlan(data: PaddleWebhook["data"]) {
  const planFromPrice = getPlanForPriceId(getSubscriptionPriceId(data))
  if (planFromPrice) {
    return planFromPrice
  }

  const planFromCustomData = data?.custom_data?.plan
  return isBillingPlan(planFromCustomData) ? planFromCustomData : null
}

export async function POST(request: Request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "PADDLE_WEBHOOK_SECRET is not configured." }, { status: 500 })
  }

  const signature = request.headers.get("paddle-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle signature." }, { status: 400 })
  }

  const body = await request.text()
  if (!verifyPaddleSignature(body, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Paddle webhook signature." }, { status: 400 })
  }

  const payload = JSON.parse(body) as PaddleWebhook
  const eventType = payload.event_type || ""
  const data = payload.data

  if (eventType.startsWith("subscription.") && data?.id) {
    syncBillingSubscription({
      provider: "paddle",
      userId: data.custom_data?.user_id || null,
      customerId: data.customer_id || null,
      subscriptionId: data.id,
      variantId: getSubscriptionPriceId(data),
      portalUrl: data.management_urls?.update_payment_method || data.management_urls?.cancel || null,
      status: data.status || (eventType === "subscription.canceled" ? "canceled" : "inactive"),
      plan: getPlan(data),
      renewsAt: data.current_billing_period?.ends_at || data.next_billed_at || data.scheduled_change?.effective_at || null,
    })
  }

  return NextResponse.json({ received: true })
}
