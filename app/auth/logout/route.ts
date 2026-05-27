import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { deleteCurrentSession, SESSION_COOKIE } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function logout(request: Request) {
  try {
    await deleteCurrentSession()
  } catch (error) {
    console.error("Failed to delete logout session.", error)
  }

  const response = NextResponse.redirect(new URL("/", getAppUrl(request)), { status: 303 })
  response.cookies.delete(SESSION_COOKIE)
  return response
}

export async function POST(request: Request) {
  return logout(request)
}

export async function GET(request: Request) {
  return logout(request)
}
