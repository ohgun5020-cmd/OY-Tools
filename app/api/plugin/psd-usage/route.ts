import { NextResponse } from "next/server"

import { getPsdUsage, getUserByPluginAccessToken } from "@/lib/auth"

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

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
        headers: corsHeaders(),
      },
    )
  }

  return NextResponse.json(
    {
      authenticated: true,
      usage: getPsdUsage(user),
      user: {
        plan: user.plan,
        planStatus: user.planStatus,
      },
    },
    {
      headers: corsHeaders(),
    },
  )
}
