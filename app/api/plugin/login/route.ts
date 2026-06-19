import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { isAdminUser } from "@/lib/admin"
import {
  authenticateEmailUser,
  createPluginAccessToken,
  getPsdUsage,
  getUserById,
  isAuthInputError,
} from "@/lib/auth"
import { getPlanEntitlement } from "@/lib/plan-entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Cache-Control": "no-store",
  }
}

function webLinks(request: Request) {
  const appUrl = getAppUrl(request)
  return {
    connect: `${appUrl}/plugin/connect`,
    dashboard: `${appUrl}/dashboard`,
    billing: `${appUrl}/dashboard#billing`,
    psdUsage: `${appUrl}/api/plugin/psd-usage`,
    psdUsageConsume: `${appUrl}/api/plugin/psd-usage/consume`,
    psdUsageRelease: `${appUrl}/api/plugin/psd-usage/release`,
    pricing: `${appUrl}/#pricing`,
    ai: `${appUrl}/api/plugin/ai`,
    magnificCredits: `${appUrl}/api/plugin/magnific/credits`,
    magnificUpscale: `${appUrl}/api/plugin/magnific/upscale`,
    magnificEdit: `${appUrl}/api/plugin/magnific/edit`,
    magnificRemoveBackground: `${appUrl}/api/plugin/magnific/remove-background`,
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === "string" ? body.email : ""
  const password = typeof body?.password === "string" ? body.password : ""

  try {
    const userId = authenticateEmailUser({ email, password })
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", links: webLinks(request) },
        { status: 401, headers: corsHeaders() },
      )
    }

    const token = createPluginAccessToken(user.id, "Piger plugin login")

    return NextResponse.json(
      {
        authenticated: true,
        token: token.token,
        tokenExpiresAt: token.expiresAt,
        user: {
          name: user.name,
          email: user.email,
          plan: user.plan,
          planStatus: user.planStatus,
          planRenewsAt: user.planRenewsAt,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          isAdmin: isAdminUser(user),
          entitlement: getPlanEntitlement(user),
          psdUsage: getPsdUsage(user),
        },
        links: webLinks(request),
      },
      {
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    if (isAuthInputError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          fieldErrors: error.fieldErrors,
          links: webLinks(request),
        },
        {
          status: 401,
          headers: corsHeaders(),
        },
      )
    }

    throw error
  }
}
