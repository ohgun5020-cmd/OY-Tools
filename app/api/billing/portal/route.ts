import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getAppUrl } from "@/lib/app-url"
import { createPaddlePortalLink, type PaddlePortalAction } from "@/lib/paddle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getPortalAction(value: FormDataEntryValue | null): PaddlePortalAction {
  if (value === "update-payment" || value === "cancel") {
    return value
  }

  return "overview"
}

function getSafeFallbackPortalUrl() {
  const portalUrl = process.env.PADDLE_CUSTOMER_PORTAL_URL
  if (!portalUrl) {
    return null
  }

  try {
    const url = new URL(portalUrl)
    if (url.hostname === "customer-portal.paddle.com" && url.pathname.includes("/subscriptions/")) {
      console.warn("Ignoring subscription-specific PADDLE_CUSTOMER_PORTAL_URL fallback.")
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  const appUrl = getAppUrl(request)

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`, 303)
  }

  const formData = await request.formData().catch(() => null)
  const action = getPortalAction(formData?.get("action") || null)

  if (user.billingCustomerId) {
    try {
      const portalLink = await createPaddlePortalLink({
        customerId: user.billingCustomerId,
        subscriptionId: user.billingSubscriptionId,
        action,
      })
      return NextResponse.redirect(portalLink, 303)
    } catch (error) {
      console.error("Failed to create Paddle portal session.", error)
    }
  }

  const portalUrl = user.billingPortalUrl || getSafeFallbackPortalUrl()
  if (!portalUrl) {
    return NextResponse.redirect(`${appUrl}/#pricing`, 303)
  }

  return NextResponse.redirect(portalUrl, 303)
}
