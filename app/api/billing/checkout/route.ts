import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { createLemonSqueezyCheckout, getBillingSetupError, isBillingPlan } from "@/lib/lemonsqueezy"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { plan?: unknown } | null
  if (!isBillingPlan(body?.plan)) {
    return NextResponse.json({ error: "지원하지 않는 요금제입니다." }, { status: 400 })
  }

  const setupError = getBillingSetupError(body.plan)
  if (setupError) {
    return NextResponse.json({ error: setupError, code: "billing_unconfigured" }, { status: 503 })
  }

  try {
    const checkoutUrl = await createLemonSqueezyCheckout({
      plan: body.plan,
      userId: user.id,
      name: user.name,
      email: user.email,
    })

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "결제 페이지를 여는 중 문제가 발생했습니다." },
      { status: 500 },
    )
  }
}
