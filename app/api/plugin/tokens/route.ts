import { NextResponse } from "next/server"

import { createPluginAccessToken, getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 })
  }

  const token = createPluginAccessToken(user.id)

  return NextResponse.json(
    {
      token: token.token,
      expiresAt: token.expiresAt,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
