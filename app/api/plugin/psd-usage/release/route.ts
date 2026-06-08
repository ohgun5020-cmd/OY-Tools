import { NextResponse } from "next/server"

import { getUserByPluginAccessToken, releasePsdUsage } from "@/lib/auth"

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

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ""
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  } catch (error) {
    return {}
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function POST(request: Request) {
  const user = getUserByPluginAccessToken(getBearerToken(request))

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
        headers: corsHeaders(),
      },
    )
  }

  const body = await readJsonBody(request)
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : null
  const source = typeof body.source === "string" ? body.source : "plugin-release"
  const result = releasePsdUsage(user, {
    idempotencyKey,
    source,
  })

  return NextResponse.json(
    {
      ok: true,
      released: result.released,
      duplicate: result.duplicate,
      usage: result.usage,
    },
    {
      headers: corsHeaders(),
    },
  )
}
