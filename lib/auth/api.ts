import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth/session"

export async function requireApiSession() {
  const session = await getSession()

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    }
  }

  return {
    session,
    response: null,
  }
}
