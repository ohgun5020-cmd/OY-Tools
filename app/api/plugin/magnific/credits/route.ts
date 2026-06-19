import { NextResponse } from "next/server"

import {
  corsHeaders,
  estimatePrecisionCredits,
  getMagnificApiKey,
  getMonthlyCreditLimit,
  requirePluginAuth,
} from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CreditUsagePoint = {
  consumptions?: Array<{
    user_credits?: unknown
    user_usages?: Array<{ user_credits?: unknown }>
  }>
}

function monthRange() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

function sumCredits(data: unknown) {
  const points = data && typeof data === "object" && "data" in data ? (data as { data?: CreditUsagePoint[] }).data || [] : []
  return points.reduce((total, point) => {
    const consumptions = point.consumptions || []
    return (
      total +
      consumptions.reduce((innerTotal, item) => {
        const direct = Number(item.user_credits || 0)
        if (Number.isFinite(direct) && direct > 0) {
          return innerTotal + direct
        }
        const nested = (item.user_usages || []).reduce((usageTotal, usage) => {
          const credits = Number(usage.user_credits || 0)
          return Number.isFinite(credits) ? usageTotal + credits : usageTotal
        }, 0)
        return innerTotal + nested
      }, 0)
    )
  }, 0)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request: Request) {
  const auth = requirePluginAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const url = new URL(request.url)
  const apiKey = getMagnificApiKey(request)
  const monthlyLimit = getMonthlyCreditLimit()
  const estimatedCredits = estimatePrecisionCredits(
    url.searchParams.get("width"),
    url.searchParams.get("height"),
    url.searchParams.get("scaleFactor"),
  )

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        usedThisMonth: null,
        monthlyLimit,
        remaining: monthlyLimit,
        estimatedCredits,
        detail: "Magnific API key is not configured.",
      },
      { headers: corsHeaders() },
    )
  }

  const { startDate, endDate } = monthRange()
  const response = await fetch("https://api.magnific.com/v1/analytics/team-credit-usage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-magnific-api-key": apiKey,
    },
    body: JSON.stringify({
      granularity: "month",
      start_date: startDate,
      end_date: endDate,
    }),
  })

  const payload = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    return NextResponse.json(
      {
        ok: true,
        configured: true,
        analyticsAvailable: false,
        usedThisMonth: null,
        monthlyLimit,
        remaining: monthlyLimit,
        estimatedCredits,
        detail: `Magnific analytics returned HTTP ${response.status}.`,
      },
      { headers: corsHeaders() },
    )
  }

  const usedThisMonth = sumCredits(payload)
  const remaining = monthlyLimit === null ? null : Math.max(0, monthlyLimit - usedThisMonth)

  return NextResponse.json(
    {
      ok: true,
      configured: true,
      analyticsAvailable: true,
      usedThisMonth,
      monthlyLimit,
      remaining,
      estimatedCredits,
      updatedAt: new Date().toISOString(),
    },
    { headers: corsHeaders() },
  )
}
