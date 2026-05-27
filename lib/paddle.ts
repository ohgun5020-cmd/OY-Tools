import { createHmac, timingSafeEqual } from "node:crypto"

import { getAppUrl } from "@/lib/app-url"

export type BillingPlan = "basic" | "pro"
export type PaddlePortalAction = "overview" | "update-payment" | "cancel"

const paddlePriceEnv: Record<BillingPlan, string> = {
  basic: "PADDLE_BASIC_PRICE_ID",
  pro: "PADDLE_PRO_PRICE_ID",
}

const defaultPaddlePriceIds: Record<BillingPlan, string> = {
  basic: "pri_01ksktfy8dsq6zjj4nq29hwz2x",
  pro: "pri_01ksktgy40nsef59aed9s4g24p",
}

const billingSetupMessage =
  "Paddle 결제 설정이 아직 완료되지 않았습니다. Railway 환경변수에 NEXT_PUBLIC_PADDLE_CLIENT_TOKEN을 추가해 주세요."

export function isBillingPlan(value: unknown): value is BillingPlan {
  return value === "basic" || value === "pro"
}

export function getPaddleEnvironment() {
  const environment = (process.env.PADDLE_ENVIRONMENT || process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "production").toLowerCase()
  return environment === "sandbox" ? "sandbox" : "production"
}

export function getPaddleClientToken() {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || process.env.PADDLE_CLIENT_TOKEN || null
}

export function getPaddleApiKey() {
  return process.env.PADDLE_API_KEY || null
}

export function getPaddleApiBaseUrl() {
  return getPaddleEnvironment() === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"
}

export function getPriceIdForPlan(plan: BillingPlan) {
  return process.env[paddlePriceEnv[plan]] || defaultPaddlePriceIds[plan]
}

export function getPlanForPriceId(priceId: string | null | undefined): BillingPlan | null {
  if (!priceId) {
    return null
  }

  for (const plan of Object.keys(paddlePriceEnv) as BillingPlan[]) {
    if (getPriceIdForPlan(plan) === priceId) {
      return plan
    }
  }

  return null
}

export function getBillingSetupError() {
  return getPaddleClientToken() ? null : billingSetupMessage
}

export function getPaddleCheckoutConfig(input: {
  plan: BillingPlan
  userId: string
  email: string
  request: Request
}) {
  const token = getPaddleClientToken()
  if (!token) {
    throw new Error(billingSetupMessage)
  }

  return {
    provider: "paddle" as const,
    token,
    environment: getPaddleEnvironment(),
    priceId: getPriceIdForPlan(input.plan),
    successUrl: `${getAppUrl(input.request)}/dashboard?billing=success`,
    customerEmail: input.email,
    customData: {
      user_id: input.userId,
      plan: input.plan,
    },
  }
}

export function verifyPaddleSignature(body: string, signatureHeader: string, secret: string) {
  const values = new Map<string, string[]>()

  for (const segment of signatureHeader.split(";")) {
    const [key, value] = segment.split("=")
    if (!key || !value) {
      continue
    }

    const existing = values.get(key) || []
    existing.push(value)
    values.set(key, existing)
  }

  const timestamp = values.get("ts")?.[0]
  const signatures = values.get("h1") || []
  if (!timestamp || signatures.length === 0) {
    return false
  }

  const timestampSeconds = Number(timestamp)
  const toleranceSeconds = Number(process.env.PADDLE_SIGNATURE_TOLERANCE_SECONDS || 300)
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > toleranceSeconds) {
    return false
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}:${body}`).digest("hex")
  const expectedBuffer = Buffer.from(expected, "hex")

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex")
    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer)
  })
}

type PaddlePortalSessionResponse = {
  data?: {
    urls?: {
      general?: {
        overview?: string
      }
      subscriptions?: Array<{
        id?: string
        cancel_subscription?: string
        update_subscription_payment_method?: string
      }>
    }
  }
}

export async function createPaddlePortalLink(input: {
  customerId: string
  subscriptionId: string | null
  action: PaddlePortalAction
}) {
  const apiKey = getPaddleApiKey()
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not configured.")
  }

  const body = input.subscriptionId ? { subscription_ids: [input.subscriptionId] } : {}
  const response = await fetch(`${getPaddleApiBaseUrl()}/customers/${input.customerId}/portal-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Paddle portal session failed with ${response.status}.`)
  }

  const payload = (await response.json()) as PaddlePortalSessionResponse
  const subscriptionUrl = payload.data?.urls?.subscriptions?.find((subscription) => subscription.id === input.subscriptionId)

  if (input.action === "cancel" && subscriptionUrl?.cancel_subscription) {
    return subscriptionUrl.cancel_subscription
  }

  if (input.action === "update-payment" && subscriptionUrl?.update_subscription_payment_method) {
    return subscriptionUrl.update_subscription_payment_method
  }

  const overviewUrl = payload.data?.urls?.general?.overview
  if (!overviewUrl) {
    throw new Error("Paddle portal session did not include an overview URL.")
  }

  return overviewUrl
}
