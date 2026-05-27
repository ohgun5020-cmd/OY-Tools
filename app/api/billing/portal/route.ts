import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getAppUrl } from "@/lib/app-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const user = await getCurrentUser()
  const appUrl = getAppUrl()

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`, 303)
  }

  if (!user.billingPortalUrl) {
    return NextResponse.redirect(`${appUrl}/#pricing`, 303)
  }

  return NextResponse.redirect(user.billingPortalUrl, 303)
}
