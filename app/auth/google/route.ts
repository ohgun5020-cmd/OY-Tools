import { randomBytes } from "node:crypto"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getAppUrl } from "@/lib/app-url"

export const runtime = "nodejs"

const stateCookie = "pigma_oauth_state"
const modeCookie = "pigma_oauth_mode"
const nextCookie = "pigma_oauth_next"

function safeNextPath(value: string | null) {
  const next = typeof value === "string" ? value.trim() : ""
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes("://")) {
    return ""
  }

  return next
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("mode") === "signup" ? "signup" : "login"
  const next = safeNextPath(url.searchParams.get("next"))
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    redirect(`/${mode}?error=google-unconfigured`)
  }

  const state = randomBytes(32).toString("base64url")
  const cookieStore = await cookies()
  cookieStore.set(stateCookie, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })
  cookieStore.set(modeCookie, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })
  if (next) {
    cookieStore.set(nextCookie, next, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    })
  }

  const redirectUri = `${getAppUrl(request)}/auth/google/callback`
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleUrl.searchParams.set("client_id", clientId)
  googleUrl.searchParams.set("redirect_uri", redirectUri)
  googleUrl.searchParams.set("response_type", "code")
  googleUrl.searchParams.set("scope", "openid email profile")
  googleUrl.searchParams.set("state", state)
  googleUrl.searchParams.set("access_type", "offline")
  googleUrl.searchParams.set("prompt", "select_account")

  redirect(googleUrl.toString())
}
