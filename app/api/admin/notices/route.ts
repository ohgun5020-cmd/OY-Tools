import { NextResponse } from "next/server"

import { isAdminUser } from "@/lib/admin"
import { getCurrentUser, getUserByPluginAccessToken } from "@/lib/auth"
import { getNoticePublicUrl, readNoticePayload, uploadNoticePayload } from "@/lib/notices"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Cache-Control": "no-store",
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ""
}

async function getAdminUser(request: Request) {
  const token = getBearerToken(request)
  const user = token ? getUserByPluginAccessToken(token) : await getCurrentUser()
  return isAdminUser(user) ? user : null
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function GET(request: Request) {
  const user = await getAdminUser(request)
  if (!user) {
    return NextResponse.json({ error: "Admin authentication is required." }, { status: 401, headers: corsHeaders() })
  }

  const payload = await readNoticePayload()
  return NextResponse.json(
    {
      noticeUrl: getNoticePublicUrl(),
      payload,
    },
    { headers: corsHeaders() },
  )
}

export async function PUT(request: Request) {
  const user = await getAdminUser(request)
  if (!user) {
    return NextResponse.json({ error: "Admin authentication is required." }, { status: 401, headers: corsHeaders() })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: corsHeaders() })
  }

  try {
    const payload = await uploadNoticePayload(body)
    return NextResponse.json(
      {
        noticeUrl: getNoticePublicUrl(),
        payload,
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Notice update failed." },
      { status: 500, headers: corsHeaders() },
    )
  }
}
