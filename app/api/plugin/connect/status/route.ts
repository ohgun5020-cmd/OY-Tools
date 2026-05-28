import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { isAdminUser } from "@/lib/admin"
import { getPluginConnectionRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Cache-Control": "no-store",
  }
}

function isConnectionPart(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,160}$/.test(value)
}

function webLinks(request: Request) {
  const appUrl = getAppUrl(request)
  return {
    connect: `${appUrl}/plugin/connect`,
    dashboard: `${appUrl}/dashboard`,
    billing: `${appUrl}/dashboard#billing`,
    pricing: `${appUrl}/#pricing`,
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestId = url.searchParams.get("requestId")
  const secret = url.searchParams.get("secret")

  if (!isConnectionPart(requestId) || !isConnectionPart(secret)) {
    return NextResponse.json({ status: "invalid", links: webLinks(request) }, { status: 400, headers: corsHeaders() })
  }

  const result = getPluginConnectionRequest(requestId, secret)
  if (result.status !== "connected") {
    return NextResponse.json({ status: result.status, links: webLinks(request) }, { headers: corsHeaders() })
  }

  return NextResponse.json(
    {
      status: "connected",
      token: result.token,
      tokenExpiresAt: result.tokenExpiresAt,
      user: {
        name: result.user.name,
        email: result.user.email,
        plan: result.user.plan,
        planStatus: result.user.planStatus,
        planRenewsAt: result.user.planRenewsAt,
        avatarUrl: result.user.avatarUrl,
        isAdmin: isAdminUser(result.user),
      },
      links: webLinks(request),
    },
    { headers: corsHeaders() },
  )
}
