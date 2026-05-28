import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { getUserByPluginAccessToken } from "@/lib/auth"

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

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ""
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function GET(request: Request) {
  const user = getUserByPluginAccessToken(getBearerToken(request))
  const appUrl = getAppUrl(request)

  return NextResponse.json(
    {
      authenticated: Boolean(user),
      user: user
        ? {
            name: user.name,
            email: user.email,
            plan: user.plan,
            planStatus: user.planStatus,
            planRenewsAt: user.planRenewsAt,
            avatarUrl: user.avatarUrl,
          }
        : null,
      links: {
        connect: `${appUrl}/plugin/connect`,
        dashboard: `${appUrl}/dashboard`,
        billing: `${appUrl}/dashboard#billing`,
        pricing: `${appUrl}/#pricing`,
      },
    },
    {
      headers: corsHeaders(),
    },
  )
}
