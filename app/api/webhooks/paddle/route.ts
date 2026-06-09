import { NextResponse } from "next/server"

import { syncBillingSubscription } from "@/lib/auth"
import { getPlanForPriceId, isBillingPricePlan, verifyPaddleSignature, type BillingPricePlan } from "@/lib/paddle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PaddleWebhook = {
  event_type?: string
  data?: {
    id?: string
    action?: string
    customer_id?: string | null
    status?: string
    subscription_id?: string | null
    type?: string | null
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

const accessRevokingTransactionEvents = new Set([
  "transaction.canceled",
  "transaction.past_due",
  "transaction.payment_failed",
])

const accessRevokingAdjustmentActions = new Set(["chargeback", "chargeback_warning"])

function getSubscriptionPriceId(data: PaddleWebhook["data"]) {
  return data?.items?.find((item) => item.price?.id)?.price?.id || null
}

function getPlan(data: PaddleWebhook["data"]) {
  const planFromPrice = getPlanForPriceId(getSubscriptionPriceId(data))
  if (planFromPrice) {
    return planFromPrice
  }

  const planFromCustomData = data?.custom_data?.plan
  return isBillingPricePlan(planFromCustomData) ? planFromCustomData : null
}

function syncSubscriptionAccess(input: {
  data: PaddleWebhook["data"]
  subscriptionId: string | null
  status: string
  plan?: BillingPricePlan | null
}) {
  if (!input.subscriptionId) {
    return false
  }

  syncBillingSubscription({
    provider: "paddle",
    userId: input.data?.custom_data?.user_id || null,
    customerId: input.data?.customer_id || null,
    subscriptionId: input.subscriptionId,
    variantId: getSubscriptionPriceId(input.data),
    portalUrl: input.data?.management_urls?.update_payment_method || input.data?.management_urls?.cancel || null,
    status: input.status,
    plan: input.plan ?? null,
    renewsAt: input.data?.current_billing_period?.ends_at || input.data?.next_billed_at || input.data?.scheduled_change?.effective_at || null,
  })

  return true
}

function shouldRevokeForAdjustment(eventType: string, data: PaddleWebhook["data"]) {
  const action = String(data?.action || "").toLowerCase()
  const status = String(data?.status || "").toLowerCase()

  if (action === "refund") {
    return status === "approved"
  }

  if (accessRevokingAdjustmentActions.has(action)) {
    return !status || status === "approved" || eventType === "adjustment.created"
  }

  return false
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
    syncSubscriptionAccess({
      data,
      subscriptionId: data.id,
      status: data.status || (eventType === "subscription.canceled" ? "canceled" : "inactive"),
      plan: getPlan(data),
    })
  }

  if (accessRevokingTransactionEvents.has(eventType) && data?.subscription_id) {
    syncSubscriptionAccess({
      data,
      subscriptionId: data.subscription_id,
      status: data.status || eventType.replace("transaction.", ""),
      plan: null,
    })
  }

  if (eventType.startsWith("adjustment.") && shouldRevokeForAdjustment(eventType, data) && data?.subscription_id) {
    const action = String(data.action || "adjusted").toLowerCase()
    syncSubscriptionAccess({
      data,
      subscriptionId: data.subscription_id,
      status: action === "refund" ? "refunded" : action,
      plan: null,
    })
  }

  return NextResponse.json({ received: true })
}
