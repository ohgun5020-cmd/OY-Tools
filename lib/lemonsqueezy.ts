import { getAppUrl } from "@/lib/app-url"

export type BillingPlan = "basic" | "pro"

const planVariantEnv: Record<BillingPlan, string> = {
  basic: "LEMON_SQUEEZY_BASIC_VARIANT_ID",
  pro: "LEMON_SQUEEZY_PRO_VARIANT_ID",
}

const billingSetupMessage = "결제 설정이 아직 완료되지 않았습니다. 잠시 후 다시 시도해 주세요."

type LemonSqueezyCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string
    }
  }
  errors?: Array<{ detail?: string; title?: string }>
}

export function isBillingPlan(value: unknown): value is BillingPlan {
  return value === "basic" || value === "pro"
}

export function getVariantIdForPlan(plan: BillingPlan) {
  return process.env[planVariantEnv[plan]] || null
}

export function getBillingSetupError(plan?: BillingPlan) {
  if (!process.env.LEMON_SQUEEZY_API_KEY || !process.env.LEMON_SQUEEZY_STORE_ID) {
    return billingSetupMessage
  }

  if (plan && !getVariantIdForPlan(plan)) {
    return billingSetupMessage
  }

  return null
}

export function getPlanForVariantId(variantId: string | number | null | undefined): BillingPlan | null {
  if (variantId === null || variantId === undefined) {
    return null
  }

  const normalizedVariantId = String(variantId)
  for (const plan of Object.keys(planVariantEnv) as BillingPlan[]) {
    if (process.env[planVariantEnv[plan]] === normalizedVariantId) {
      return plan
    }
  }

  return null
}

export async function createLemonSqueezyCheckout(input: {
  plan: BillingPlan
  userId: string
  name: string
  email: string
}) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID
  const variantId = getVariantIdForPlan(input.plan)

  if (!apiKey) {
    throw new Error(billingSetupMessage)
  }

  if (!storeId) {
    throw new Error(billingSetupMessage)
  }

  if (!variantId) {
    throw new Error(billingSetupMessage)
  }

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: input.email,
            name: input.name,
            custom: {
              user_id: input.userId,
              plan: input.plan,
            },
          },
          checkout_options: {
            embed: false,
            media: false,
          },
          product_options: {
            enabled_variants: [Number(variantId)],
            redirect_url: `${getAppUrl()}/dashboard?billing=success`,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  })

  const payload = (await response.json().catch(() => null)) as LemonSqueezyCheckoutResponse | null
  const checkoutUrl = payload?.data?.attributes?.url

  if (!response.ok || !checkoutUrl) {
    const message = payload?.errors?.[0]?.detail || payload?.errors?.[0]?.title || "Failed to create Lemon Squeezy checkout."
    throw new Error(message)
  }

  return checkoutUrl
}
