import { NextResponse } from "next/server"

import { completePluginConnectionRequest, getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isConnectionPart(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,160}$/.test(value)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { requestId?: unknown; secret?: unknown } | null
  if (!isConnectionPart(body?.requestId) || !isConnectionPart(body?.secret)) {
    return NextResponse.json({ error: "Invalid plugin connection request." }, { status: 400 })
  }

  const result = completePluginConnectionRequest({
    requestId: body.requestId,
    secret: body.secret,
    userId: user.id,
  })

  return NextResponse.json(
    {
      ok: true,
      expiresAt: result.expiresAt,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
