import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getCurrentUser()

  return NextResponse.json(
    {
      user: user
        ? {
            name: user.name,
            email: user.email,
            plan: user.plan,
            avatarUrl: user.avatarUrl,
          }
        : null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
