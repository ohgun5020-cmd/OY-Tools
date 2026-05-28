import type { AuthUser } from "./auth"

const DEFAULT_ADMIN_EMAIL = "ohgun5020@gmail.com"

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function parseEmailList(value: string | undefined) {
  return String(value || "")
    .split(/[,\s;]+/)
    .map(normalizeEmail)
    .filter(Boolean)
}

export function getAdminEmails() {
  const configured = parseEmailList(process.env.PIGMA_ADMIN_EMAILS || process.env.ADMIN_EMAILS)
  return Array.from(new Set([DEFAULT_ADMIN_EMAIL, ...configured]))
}

export function isAdminEmail(email: string) {
  const normalized = normalizeEmail(email)
  return normalized ? getAdminEmails().includes(normalized) : false
}

export function isAdminUser(user: Pick<AuthUser, "email"> | null | undefined) {
  return Boolean(user?.email && isAdminEmail(user.email))
}
