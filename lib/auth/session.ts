import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const SESSION_COOKIE = "oy_admin_session"

type SessionPayload = {
  email: string
  exp: number
}

export type AdminSession = {
  email: string
  expiresAt: string
}

export function getAdminRuntimeConfig() {
  const isProduction = process.env.NODE_ENV === "production"
  const email = process.env.ADMIN_EMAIL || "admin@oy.tools"
  const password = process.env.ADMIN_PASSWORD || (isProduction ? "" : "oy-admin")

  return {
    email,
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    devFallbackEnabled: !isProduction && (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET),
    isProduction,
    password,
  }
}

export function validateAdminCredentials(email: string, password: string) {
  const config = getAdminRuntimeConfig()

  if (!config.password) {
    return false
  }

  return email.trim().toLowerCase() === config.email.toLowerCase() && password === config.password
}

export function createSessionToken(email: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7
  const payload = Buffer.from(JSON.stringify({ email, exp } satisfies SessionPayload)).toString("base64url")
  const signature = signPayload(payload)

  return `${payload}.${signature}`
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null
  }

  const [payload, signature] = token.split(".")

  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload

    if (!parsed.email || parsed.exp < Date.now()) {
      return null
    }

    return {
      email: parsed.email,
      expiresAt: new Date(parsed.exp).toISOString(),
    } satisfies AdminSession
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()

  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url")
}

function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production")
  }

  return "local-dev-only-change-me"
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}
