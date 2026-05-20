import { NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/lib/auth/session"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 })

  return response
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 })

  return response
}
