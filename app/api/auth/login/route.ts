import { NextResponse } from "next/server"
import { z } from "zod"

import {
  SESSION_COOKIE,
  createSessionToken,
  getAdminRuntimeConfig,
  getSessionCookieOptions,
  validateAdminCredentials,
} from "@/lib/auth/session"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: "이메일과 비밀번호를 확인해주세요." }, { status: 400 })
  }

  if (!validateAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: "관리자 로그인 정보가 올바르지 않습니다." }, { status: 401 })
  }

  const config = getAdminRuntimeConfig()
  const response = NextResponse.json({ ok: true })

  response.cookies.set(SESSION_COOKIE, createSessionToken(config.email), getSessionCookieOptions())

  return response
}
