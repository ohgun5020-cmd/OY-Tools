import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto"
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

import { cookies } from "next/headers"

import { FREE_ACCOUNT_BETA_PERIOD_ACTIVE } from "./beta-flags"

export const SESSION_COOKIE = "pigma_session"
const PASSWORD_PREFIX = "scrypt"
const SESSION_HOURS = 8
const REMEMBER_SESSION_DAYS = 30
const PLUGIN_TOKEN_DAYS = 365
const PLUGIN_CONNECTION_MINUTES = 15
const paidPlanStatuses = new Set(["active", "on_trial", "trialing"])
const paymentGraceStatuses = new Set(["past_due", "payment_failed"])
const immediateRevokeStatuses = new Set(["canceled", "refunded", "chargeback", "chargeback_warning"])
const PAYMENT_GRACE_DAYS = 3
const FREE_PSD_USAGE_LIMIT = 5

type PaidPlan = "basic" | "pro" | "basic_yearly" | "pro_yearly"
type ManualPlan = "free" | PaidPlan | "admin"

type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string | null
  plan: string
  provider: string
  google_id: string | null
  avatar_url: string | null
  billing_provider: string | null
  billing_customer_id: string | null
  billing_subscription_id: string | null
  billing_variant_id: string | null
  billing_portal_url: string | null
  plan_status: string
  plan_renews_at: string | null
  pending_plan: string | null
  pending_plan_effective_at: string | null
  billing_updated_at: string | null
  created_at: string
  updated_at: string
}

type SessionRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
}

type PsdUsagePeriod = "lifetime" | "day" | "month" | "year"

export const PSD_USAGE_POLICY_NOTE =
  "무료 계정은 계정당 총 5회까지 PSD를 만들 수 있습니다. 유료 월간은 월 단위, 유료 연간은 연 단위로 PSD 파일 개수만큼 차감됩니다."
export const FREE_BETA_PSD_USAGE_POLICY_NOTE = "무료 베타 기간에는 PSD 만들기를 무제한으로 사용할 수 있습니다."

export const FREE_BETA_PSD_USAGE_POLICY_ITEMS = [
  "베타 기간 동안 무료 계정도 PSD 만들기를 무제한으로 사용할 수 있습니다.",
  "베타 종료 후 정식 쿼터 정책으로 전환될 수 있습니다.",
  "PSD가 다운로드 가능 상태가 되지 않으면 예약 차감 대상이 아닙니다.",
]

export const PSD_USAGE_POLICY_ITEMS = [
  "월간 Basic/Pro는 이번 달 사용량을 공유하고, 연간 Basic/Pro는 올해 사용량을 공유합니다.",
  "무료 계정의 5회 사용량은 계정 전체 기준이며 매일 리셋되지 않습니다.",
  "업그레이드는 즉시 적용하고, 다운그레이드는 다음 결제일부터 적용합니다.",
  "ZIP으로 PSD 10개가 생성되면 10회 차감합니다.",
  "PSD가 다운로드 가능 상태가 되지 않으면 예약 차감을 복구합니다.",
  "결제 실패는 3일 유예, 환불과 차지백은 즉시 회수합니다.",
  "남은 횟수는 이월되지 않으며 리셋은 한국 시간(KST) 기준입니다.",
]

export type PluginAccessToken = {
  token: string
  expiresAt: string
}

export type PsdUsageState = {
  plan: string
  planLabel: string
  limit: number | null
  used: number
  remaining: number | null
  period: PsdUsagePeriod
  periodKey: string
  resetsAt: string | null
  unlimited: boolean
  freeBetaUnlimited: boolean
  policyNote: string
  policyItems: string[]
}

export type PsdUsageConsumeResult = {
  allowed: boolean
  duplicate: boolean
  usage: PsdUsageState
}

export type PsdUsageReleaseResult = {
  released: boolean
  duplicate: boolean
  usage: PsdUsageState
}

type PsdQuotaConfig = {
  plan: string
  planLabel: string
  limit: number | null
  period: PsdUsagePeriod
  freeBetaUnlimited: boolean
}

export type PluginConnectionResult =
  | { status: "pending" }
  | { status: "connected"; token: string; tokenExpiresAt: string; user: AuthUser }
  | { status: "expired" | "invalid" }

export type AuthUser = {
  id: string
  name: string
  email: string
  plan: string
  provider: string
  avatarUrl: string | null
  billingProvider: string | null
  billingCustomerId: string | null
  billingSubscriptionId: string | null
  billingVariantId: string | null
  billingPortalUrl: string | null
  planStatus: string
  planRenewsAt: string | null
  createdAt: string
}

export type AdminUserListItem = AuthUser & {
  psdUsage: PsdUsageState
  activeSessions: number
  activePluginTokens: number
  billingUpdatedAt: string | null
}

export type GoogleProfile = {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

class AuthInputError extends Error {
  fieldErrors?: Record<string, string>

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = "AuthInputError"
    this.fieldErrors = fieldErrors
  }
}

let db: DatabaseSync | null = null

function dataDir() {
  return process.env.PIGMA_DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "data")
}

function databasePath() {
  return process.env.PIGMA_AUTH_DB || path.join(dataDir(), "pigma.sqlite")
}

function getDb() {
  if (db) {
    return db
  }

  const dir = path.dirname(databasePath())
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  db = new DatabaseSync(databasePath(), { timeout: 5000 })
  migrate(db)
  return db
}

function migrate(database: DatabaseSync) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      provider TEXT NOT NULL DEFAULT 'email',
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      billing_provider TEXT,
      billing_customer_id TEXT,
      billing_subscription_id TEXT,
      billing_variant_id TEXT,
      billing_portal_url TEXT,
      plan_status TEXT NOT NULL DEFAULT 'free',
      plan_renews_at TEXT,
      pending_plan TEXT,
      pending_plan_effective_at TEXT,
      billing_updated_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS plugin_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      label TEXT,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS plugin_tokens_user_id_idx ON plugin_tokens(user_id);
    CREATE INDEX IF NOT EXISTS plugin_tokens_expires_at_idx ON plugin_tokens(expires_at);

    CREATE TABLE IF NOT EXISTS plugin_connection_requests (
      id TEXT PRIMARY KEY,
      secret_hash TEXT NOT NULL,
      user_id TEXT,
      plugin_token TEXT,
      token_expires_at TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      consumed_at TEXT,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS plugin_connection_requests_expires_at_idx ON plugin_connection_requests(expires_at);

    CREATE TABLE IF NOT EXISTS psd_usage_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_key TEXT NOT NULL,
      period_type TEXT NOT NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 1,
      source TEXT,
      idempotency_key TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS psd_usage_events_user_period_idx ON psd_usage_events(user_id, period_key);
    CREATE INDEX IF NOT EXISTS psd_usage_events_created_at_idx ON psd_usage_events(created_at);
    CREATE UNIQUE INDEX IF NOT EXISTS psd_usage_events_user_idempotency_idx
      ON psd_usage_events(user_id, idempotency_key)
      WHERE idempotency_key IS NOT NULL;
  `)

  ensureColumn(database, "users", "password_hash", "ALTER TABLE users ADD COLUMN password_hash TEXT")
  ensureColumn(database, "users", "plan", "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'")
  ensureColumn(database, "users", "provider", "ALTER TABLE users ADD COLUMN provider TEXT NOT NULL DEFAULT 'email'")
  ensureColumn(database, "users", "google_id", "ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE")
  ensureColumn(database, "users", "avatar_url", "ALTER TABLE users ADD COLUMN avatar_url TEXT")
  ensureColumn(database, "users", "billing_provider", "ALTER TABLE users ADD COLUMN billing_provider TEXT")
  ensureColumn(database, "users", "billing_customer_id", "ALTER TABLE users ADD COLUMN billing_customer_id TEXT")
  ensureColumn(database, "users", "billing_subscription_id", "ALTER TABLE users ADD COLUMN billing_subscription_id TEXT")
  ensureColumn(database, "users", "billing_variant_id", "ALTER TABLE users ADD COLUMN billing_variant_id TEXT")
  ensureColumn(database, "users", "billing_portal_url", "ALTER TABLE users ADD COLUMN billing_portal_url TEXT")
  ensureColumn(database, "users", "plan_status", "ALTER TABLE users ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'free'")
  ensureColumn(database, "users", "plan_renews_at", "ALTER TABLE users ADD COLUMN plan_renews_at TEXT")
  ensureColumn(database, "users", "pending_plan", "ALTER TABLE users ADD COLUMN pending_plan TEXT")
  ensureColumn(database, "users", "pending_plan_effective_at", "ALTER TABLE users ADD COLUMN pending_plan_effective_at TEXT")
  ensureColumn(database, "users", "billing_updated_at", "ALTER TABLE users ADD COLUMN billing_updated_at TEXT")
  ensureColumn(database, "users", "updated_at", "ALTER TABLE users ADD COLUMN updated_at TEXT")

  database.exec(`
    CREATE INDEX IF NOT EXISTS users_billing_customer_id_idx ON users(billing_customer_id);
    CREATE INDEX IF NOT EXISTS users_billing_subscription_id_idx ON users(billing_subscription_id);
  `)
}

function ensureColumn(database: DatabaseSync, table: string, column: string, sql: string) {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all()
  const exists = rows.some((row) => row.name === column)
  if (!exists) {
    database.exec(sql)
  }
}

function nowIso() {
  return new Date().toISOString()
}

function addDaysIso(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

function normalizePlanId(plan: string | null | undefined) {
  return String(plan || "free").trim().toLowerCase().replace(/[-\s]+/g, "_")
}

function normalizePaidPlan(plan: string | null | undefined): PaidPlan | null {
  const normalizedPlan = normalizePlanId(plan)
  if (normalizedPlan === "basic_yearly" || normalizedPlan === "basic_annual" || normalizedPlan === "basic_year") {
    return "basic_yearly"
  }
  if (normalizedPlan === "pro_yearly" || normalizedPlan === "pro_annual" || normalizedPlan === "pro_year") {
    return "pro_yearly"
  }
  if (normalizedPlan === "basic" || normalizedPlan === "pro") {
    return normalizedPlan
  }
  return null
}

function getPlanTierValue(plan: string | null | undefined) {
  const normalizedPlan = normalizePlanId(plan)
  if (normalizedPlan === "admin") {
    return 3
  }
  const paidPlan = normalizePaidPlan(normalizedPlan)
  if (paidPlan === "pro" || paidPlan === "pro_yearly") {
    return 2
  }
  if (paidPlan === "basic" || paidPlan === "basic_yearly") {
    return 1
  }
  return 0
}

function resolvePendingPlan(row: Pick<UserRow, "plan" | "pending_plan" | "pending_plan_effective_at">, now = new Date()) {
  const rawPendingPlan = String(row.pending_plan || "").trim()
  if (!rawPendingPlan) {
    return row.plan
  }

  const pendingPlan = normalizePlanId(rawPendingPlan)
  const effectiveAt = row.pending_plan_effective_at ? new Date(row.pending_plan_effective_at) : null
  if (!effectiveAt || Number.isNaN(effectiveAt.getTime())) {
    return row.plan
  }

  return effectiveAt.getTime() <= now.getTime() ? pendingPlan : row.plan
}

function isManualBillingOverride(row: Pick<UserRow, "billing_provider"> | null | undefined) {
  return String(row?.billing_provider || "").toLowerCase() === "manual"
}

function getKstDateParts(date = new Date()) {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

function pad2(value: number) {
  return String(value).padStart(2, "0")
}

function getPsdQuotaConfig(user: Pick<AuthUser, "plan" | "createdAt">): PsdQuotaConfig {
  const normalizedPlan = normalizePlanId(user.plan)

  if (normalizedPlan === "admin") {
    return {
      plan: "admin",
      planLabel: "관리자",
      limit: null,
      period: "month",
      freeBetaUnlimited: false,
    }
  }

  const paidPlan = normalizePaidPlan(normalizedPlan)

  if (paidPlan === "pro_yearly") {
    return {
      plan: "pro_yearly",
      planLabel: "$5 연간 회원",
      limit: 3600,
      period: "year",
      freeBetaUnlimited: false,
    }
  }

  if (paidPlan === "basic_yearly") {
    return {
      plan: "basic_yearly",
      planLabel: "$2 연간 회원",
      limit: 600,
      period: "year",
      freeBetaUnlimited: false,
    }
  }

  if (paidPlan === "pro") {
    return {
      plan: "pro",
      planLabel: "$5 회원",
      limit: 300,
      period: "month",
      freeBetaUnlimited: false,
    }
  }

  if (paidPlan === "basic") {
    return {
      plan: "basic",
      planLabel: "$2 회원",
      limit: 50,
      period: "month",
      freeBetaUnlimited: false,
    }
  }

  if (FREE_ACCOUNT_BETA_PERIOD_ACTIVE) {
    return {
      plan: "free",
      planLabel: "무료 베타",
      limit: null,
      period: "lifetime",
      freeBetaUnlimited: true,
    }
  }

  return {
    plan: "free",
    planLabel: "무료 계정",
    limit: FREE_PSD_USAGE_LIMIT,
    period: "lifetime",
    freeBetaUnlimited: false,
  }
}

function getPsdPeriod(period: PsdUsagePeriod, date = new Date()) {
  if (period === "lifetime") {
    return {
      periodKey: "lifetime",
      resetsAt: null,
    }
  }

  const parts = getKstDateParts(date)
  const month = pad2(parts.month)
  const day = pad2(parts.day)

  if (period === "day") {
    return {
      periodKey: `${parts.year}-${month}-${day}`,
      resetsAt: new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1) - 9 * 60 * 60 * 1000).toISOString(),
    }
  }

  if (period === "year") {
    return {
      periodKey: `${parts.year}`,
      resetsAt: new Date(Date.UTC(parts.year + 1, 0, 1) - 9 * 60 * 60 * 1000).toISOString(),
    }
  }

  return {
    periodKey: `${parts.year}-${month}`,
    resetsAt: new Date(Date.UTC(parts.year, parts.month, 1) - 9 * 60 * 60 * 1000).toISOString(),
  }
}

function sanitizeIdempotencyKey(value: string | null | undefined) {
  const key = String(value || "").trim()
  return key ? key.slice(0, 200) : null
}

function normalizePsdUsageAmount(value: unknown) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return 1
  }
  return Math.max(1, Math.min(10000, Math.floor(amount)))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url")
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url")
  const hash = scryptSync(password, salt, 64).toString("base64url")
  return `${PASSWORD_PREFIX}$${salt}$${hash}`
}

function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, hash] = storedHash.split("$")
  if (prefix !== PASSWORD_PREFIX || !salt || !hash) {
    return false
  }

  const expected = Buffer.from(hash, "base64url")
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function toUser(row: UserRow): AuthUser {
  const plan = resolvePendingPlan(row) || "free"

  return {
    id: row.id,
    name: row.name || row.email?.split("@")[0] || "User",
    email: row.email,
    plan,
    provider: row.provider || "email",
    avatarUrl: row.avatar_url || null,
    billingProvider: row.billing_provider || null,
    billingCustomerId: row.billing_customer_id || null,
    billingSubscriptionId: row.billing_subscription_id || null,
    billingVariantId: row.billing_variant_id || null,
    billingPortalUrl: row.billing_portal_url || null,
    planStatus: row.plan_status || plan,
    planRenewsAt: row.plan_renews_at || null,
    createdAt: row.created_at || nowIso(),
  }
}

export function authError(message: string, fieldErrors?: Record<string, string>) {
  return new AuthInputError(message, fieldErrors)
}

export function isAuthInputError(error: unknown): error is AuthInputError {
  return error instanceof AuthInputError
}

export function createEmailUser(input: { name: string; email: string; password: string; plan: string }) {
  const name = normalizeName(input.name)
  const email = normalizeEmail(input.email)
  const password = input.password.trim()
  const fieldErrors: Record<string, string> = {}

  if (name.length < 2) {
    fieldErrors.name = "이름은 2자 이상 입력해주세요."
  }

  if (!validateEmail(email)) {
    fieldErrors.email = "사용 가능한 이메일을 입력해주세요."
  }

  if (password.length < 8) {
    fieldErrors.password = "비밀번호는 8자 이상이어야 합니다."
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw authError("입력값을 다시 확인해주세요.", fieldErrors)
  }

  const database = getDb()
  const existing = database.prepare("SELECT id, provider, password_hash FROM users WHERE email = ?").get(email) as
    | Pick<UserRow, "id" | "provider" | "password_hash">
    | undefined

  if (existing) {
    throw authError("이미 가입된 이메일입니다. 로그인으로 이어가주세요.", { email: "이미 가입된 이메일입니다." })
  }

  const id = randomUUID()
  const timestamp = nowIso()
  database.prepare(`
    INSERT INTO users (id, name, email, password_hash, plan, provider, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'email', ?, ?)
  `).run(id, name, email, hashPassword(password), "free", timestamp, timestamp)

  return id
}

export function authenticateEmailUser(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email)
  const password = input.password
  const fieldErrors: Record<string, string> = {}

  if (!validateEmail(email)) {
    fieldErrors.email = "이메일 형식을 확인해주세요."
  }

  if (!password) {
    fieldErrors.password = "비밀번호를 입력해주세요."
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw authError("입력값을 다시 확인해주세요.", fieldErrors)
  }

  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
  if (!row) {
    throw authError("이메일 또는 비밀번호가 맞지 않습니다.")
  }

  if (!row.password_hash) {
    throw authError("Google 계정으로 가입된 이메일입니다. Google 로그인을 사용해주세요.")
  }

  if (!verifyPassword(password, row.password_hash)) {
    throw authError("이메일 또는 비밀번호가 맞지 않습니다.")
  }

  return row.id
}

export function upsertGoogleUser(profile: GoogleProfile) {
  const email = normalizeEmail(profile.email)
  if (!profile.email_verified || !validateEmail(email)) {
    throw authError("Google 계정의 이메일 인증 상태를 확인할 수 없습니다.")
  }

  const database = getDb()
  const existingByGoogle = database.prepare("SELECT * FROM users WHERE google_id = ?").get(profile.sub) as UserRow | undefined
  const existingByEmail = database.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
  const timestamp = nowIso()

  if (existingByGoogle && existingByEmail && existingByGoogle.id !== existingByEmail.id) {
    throw authError("Google 계정이 이미 다른 PIGMA 계정과 연결되어 있습니다.", {
      google: "conflict",
    })
  }

  if (existingByGoogle) {
    database.prepare("UPDATE users SET name = ?, avatar_url = ?, provider = ?, updated_at = ? WHERE id = ?").run(
      normalizeName(profile.name || existingByGoogle.name),
      profile.picture || existingByGoogle.avatar_url,
      existingByGoogle.password_hash ? "email+google" : "google",
      timestamp,
      existingByGoogle.id,
    )
    return existingByGoogle.id
  }

  if (existingByEmail) {
    if (existingByEmail.google_id && existingByEmail.google_id !== profile.sub) {
      throw authError("이 이메일은 이미 다른 Google 계정과 연결되어 있습니다.", {
        google: "conflict",
      })
    }

    database.prepare("UPDATE users SET google_id = ?, avatar_url = ?, provider = ?, updated_at = ? WHERE id = ?").run(
      profile.sub,
      profile.picture || existingByEmail.avatar_url,
      existingByEmail.password_hash ? "email+google" : "google",
      timestamp,
      existingByEmail.id,
    )
    return existingByEmail.id
  }

  const id = randomUUID()
  database.prepare(`
    INSERT INTO users (id, name, email, password_hash, plan, provider, google_id, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, NULL, 'free', 'google', ?, ?, ?, ?)
  `).run(id, normalizeName(profile.name || email.split("@")[0]), email, profile.sub, profile.picture || null, timestamp, timestamp)

  return id
}

export async function createSessionCookie(userId: string, remember = false) {
  cleanupExpiredSessions()

  const token = randomBytes(32).toString("base64url")
  const createdAt = new Date()
  const expiresAt = remember
    ? new Date(createdAt.getTime() + REMEMBER_SESSION_DAYS * 24 * 60 * 60 * 1000)
    : new Date(createdAt.getTime() + SESSION_HOURS * 60 * 60 * 1000)

  getDb().prepare(`
    INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, hashToken(token), createdAt.toISOString(), expiresAt.toISOString())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) {
    return null
  }

  const row = getDb().prepare(`
    SELECT users.*
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    LIMIT 1
  `).get(hashToken(token), nowIso()) as UserRow | undefined

  return row ? toUser(row) : null
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token))
  }

  cookieStore.delete(SESSION_COOKIE)
}

export function cleanupExpiredSessions() {
  getDb().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(nowIso())
}

export function createPluginAccessToken(userId: string, label = "Pigma plugin"): PluginAccessToken {
  const user = getUserById(userId)
  if (!user) {
    throw authError("User not found.")
  }

  cleanupExpiredPluginTokens()

  const token = `pigma_pat_${randomBytes(32).toString("base64url")}`
  const timestamp = nowIso()
  const expiresAt = new Date(Date.now() + PLUGIN_TOKEN_DAYS * 24 * 60 * 60 * 1000).toISOString()

  getDb().prepare(`
    INSERT INTO plugin_tokens (id, user_id, token_hash, label, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, hashToken(token), label.trim() || "Pigma plugin", timestamp, expiresAt)

  return {
    token,
    expiresAt,
  }
}

export function getUserByPluginAccessToken(token: string) {
  const cleanedToken = String(token || "").trim()
  if (!cleanedToken) {
    return null
  }

  const database = getDb()
  const tokenHash = hashToken(cleanedToken)
  const timestamp = nowIso()
  const row = database.prepare(`
    SELECT users.*
    FROM plugin_tokens
    JOIN users ON users.id = plugin_tokens.user_id
    WHERE plugin_tokens.token_hash = ?
      AND plugin_tokens.revoked_at IS NULL
      AND plugin_tokens.expires_at > ?
    LIMIT 1
  `).get(tokenHash, timestamp) as UserRow | undefined

  if (!row) {
    return null
  }

  database.prepare("UPDATE plugin_tokens SET last_used_at = ? WHERE token_hash = ?").run(timestamp, tokenHash)
  return toUser(row)
}

export function cleanupExpiredPluginTokens() {
  getDb().prepare("DELETE FROM plugin_tokens WHERE expires_at <= ?").run(nowIso())
}

export function completePluginConnectionRequest(input: { requestId: string; secret: string; userId: string }) {
  const requestId = input.requestId.trim()
  const secret = input.secret.trim()
  if (!requestId || !secret) {
    throw authError("Invalid plugin connection request.")
  }

  const user = getUserById(input.userId)
  if (!user) {
    throw authError("User not found.")
  }

  cleanupExpiredPluginConnectionRequests()

  const token = createPluginAccessToken(input.userId)
  const timestamp = nowIso()
  const expiresAt = new Date(Date.now() + PLUGIN_CONNECTION_MINUTES * 60 * 1000).toISOString()

  getDb().prepare(`
    INSERT INTO plugin_connection_requests (
      id,
      secret_hash,
      user_id,
      plugin_token,
      token_expires_at,
      created_at,
      completed_at,
      consumed_at,
      expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
    ON CONFLICT(id) DO UPDATE SET
      secret_hash = excluded.secret_hash,
      user_id = excluded.user_id,
      plugin_token = excluded.plugin_token,
      token_expires_at = excluded.token_expires_at,
      completed_at = excluded.completed_at,
      consumed_at = NULL,
      expires_at = excluded.expires_at
  `).run(requestId, hashToken(secret), input.userId, token.token, token.expiresAt, timestamp, timestamp, expiresAt)

  return {
    expiresAt,
    tokenExpiresAt: token.expiresAt,
  }
}

export function getPluginConnectionRequest(requestId: string, secret: string): PluginConnectionResult {
  const cleanedRequestId = requestId.trim()
  const cleanedSecret = secret.trim()
  if (!cleanedRequestId || !cleanedSecret) {
    return { status: "invalid" }
  }

  cleanupExpiredPluginConnectionRequests()

  const row = getDb().prepare(`
    SELECT *
    FROM plugin_connection_requests
    WHERE id = ?
    LIMIT 1
  `).get(cleanedRequestId) as
    | {
        id: string
        secret_hash: string
        user_id: string | null
        plugin_token: string | null
        token_expires_at: string | null
        consumed_at: string | null
        expires_at: string
      }
    | undefined

  if (!row) {
    return { status: "pending" }
  }

  if (row.secret_hash !== hashToken(cleanedSecret)) {
    return { status: "invalid" }
  }

  if (row.expires_at <= nowIso()) {
    return { status: "expired" }
  }

  if (row.consumed_at) {
    return { status: "expired" }
  }

  if (!row.user_id || !row.plugin_token || !row.token_expires_at) {
    return { status: "pending" }
  }

  const user = getUserById(row.user_id)
  if (!user) {
    return { status: "invalid" }
  }

  getDb()
    .prepare("UPDATE plugin_connection_requests SET consumed_at = ?, plugin_token = NULL WHERE id = ?")
    .run(nowIso(), cleanedRequestId)

  return {
    status: "connected",
    token: row.plugin_token,
    tokenExpiresAt: row.token_expires_at,
    user,
  }
}

export function cleanupExpiredPluginConnectionRequests() {
  getDb().prepare("DELETE FROM plugin_connection_requests WHERE expires_at <= ?").run(nowIso())
}

function getPsdUsageWithDatabase(database: DatabaseSync, user: Pick<AuthUser, "id" | "plan" | "createdAt">): PsdUsageState {
  const quota = getPsdQuotaConfig(user)
  const period = getPsdPeriod(quota.period)
  const row =
    quota.period === "lifetime"
      ? (database
          .prepare("SELECT COALESCE(SUM(amount), 0) AS used FROM psd_usage_events WHERE user_id = ? AND plan = ?")
          .get(user.id, quota.plan) as { used: number | null } | undefined)
      : (database
          .prepare(
            "SELECT COALESCE(SUM(amount), 0) AS used FROM psd_usage_events WHERE user_id = ? AND period_key = ? AND period_type = ?",
          )
          .get(user.id, period.periodKey, quota.period) as { used: number | null } | undefined)
  const used = Math.max(0, Number(row?.used || 0))
  const remaining = quota.limit === null ? null : Math.max(0, quota.limit - used)

  return {
    plan: quota.plan,
    planLabel: quota.planLabel,
    limit: quota.limit,
    used,
    remaining,
    period: quota.period,
    periodKey: period.periodKey,
    resetsAt: period.resetsAt,
    unlimited: quota.limit === null,
    freeBetaUnlimited: quota.freeBetaUnlimited,
    policyNote: quota.freeBetaUnlimited ? FREE_BETA_PSD_USAGE_POLICY_NOTE : PSD_USAGE_POLICY_NOTE,
    policyItems: quota.freeBetaUnlimited ? FREE_BETA_PSD_USAGE_POLICY_ITEMS : PSD_USAGE_POLICY_ITEMS,
  }
}

export function getPsdUsage(user: Pick<AuthUser, "id" | "plan" | "createdAt">): PsdUsageState {
  return getPsdUsageWithDatabase(getDb(), user)
}

export function consumePsdUsage(
  user: Pick<AuthUser, "id" | "plan" | "createdAt">,
  input: { source?: string; idempotencyKey?: string | null; amount?: unknown } = {},
): PsdUsageConsumeResult {
  const database = getDb()
  const idempotencyKey = sanitizeIdempotencyKey(input.idempotencyKey)
  const source = String(input.source || "plugin").trim().slice(0, 80) || "plugin"
  const amount = normalizePsdUsageAmount(input.amount)

  database.exec("BEGIN IMMEDIATE")
  try {
    if (idempotencyKey) {
      const existing = database
        .prepare("SELECT id FROM psd_usage_events WHERE user_id = ? AND idempotency_key = ? LIMIT 1")
        .get(user.id, idempotencyKey) as { id: string } | undefined

      if (existing) {
        const usage = getPsdUsageWithDatabase(database, user)
        database.exec("COMMIT")
        return {
          allowed: true,
          duplicate: true,
          usage,
        }
      }
    }

    const usage = getPsdUsageWithDatabase(database, user)
    if (usage.limit !== null && Number(usage.remaining || 0) < amount) {
      database.exec("ROLLBACK")
      return {
        allowed: false,
        duplicate: false,
        usage,
      }
    }

    database
      .prepare(
        `
          INSERT INTO psd_usage_events (
            id,
            user_id,
            period_key,
            period_type,
            plan,
            amount,
            source,
            idempotency_key,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        randomUUID(),
        user.id,
        usage.periodKey,
        usage.period,
        usage.plan,
        amount,
        source,
        idempotencyKey,
        nowIso(),
      )
    const nextUsage = getPsdUsageWithDatabase(database, user)
    database.exec("COMMIT")
    return {
      allowed: true,
      duplicate: false,
      usage: nextUsage,
    }
  } catch (error) {
    try {
      database.exec("ROLLBACK")
    } catch {}

    if (idempotencyKey && String(error).toLowerCase().includes("unique")) {
      return {
        allowed: true,
        duplicate: true,
        usage: getPsdUsage(user),
      }
    }
    throw error
  }
}

export function releasePsdUsage(
  user: Pick<AuthUser, "id" | "plan" | "createdAt">,
  input: { source?: string; idempotencyKey?: string | null } = {},
): PsdUsageReleaseResult {
  const database = getDb()
  const idempotencyKey = sanitizeIdempotencyKey(input.idempotencyKey)
  const source = String(input.source || "plugin-release").trim().slice(0, 80) || "plugin-release"

  if (!idempotencyKey) {
    return {
      released: false,
      duplicate: false,
      usage: getPsdUsage(user),
    }
  }

  const releaseKey = sanitizeIdempotencyKey(`release:${idempotencyKey}`)
  database.exec("BEGIN IMMEDIATE")
  try {
    const existing = database
      .prepare(
        "SELECT period_key, period_type, plan, amount FROM psd_usage_events WHERE user_id = ? AND idempotency_key = ? AND amount > 0 LIMIT 1",
      )
      .get(user.id, idempotencyKey) as
      | { period_key: string; period_type: PsdUsagePeriod; plan: string; amount: number }
      | undefined

    if (!existing) {
      const usage = getPsdUsageWithDatabase(database, user)
      database.exec("ROLLBACK")
      return {
        released: false,
        duplicate: false,
        usage,
      }
    }

    if (releaseKey) {
      const duplicate = database
        .prepare("SELECT id FROM psd_usage_events WHERE user_id = ? AND idempotency_key = ? LIMIT 1")
        .get(user.id, releaseKey) as { id: string } | undefined

      if (duplicate) {
        const usage = getPsdUsageWithDatabase(database, user)
        database.exec("COMMIT")
        return {
          released: true,
          duplicate: true,
          usage,
        }
      }
    }

    const releaseAmount = -normalizePsdUsageAmount(existing.amount)
    database
      .prepare(
        `
          INSERT INTO psd_usage_events (
            id,
            user_id,
            period_key,
            period_type,
            plan,
            amount,
            source,
            idempotency_key,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(randomUUID(), user.id, existing.period_key, existing.period_type, existing.plan, releaseAmount, source, releaseKey, nowIso())

    const usage = getPsdUsageWithDatabase(database, user)
    database.exec("COMMIT")
    return {
      released: true,
      duplicate: false,
      usage,
    }
  } catch (error) {
    try {
      database.exec("ROLLBACK")
    } catch {}
    throw error
  }
}

export function getUserStats(userId: string) {
  const activeSessions = getDb().prepare("SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND expires_at > ?").get(
    userId,
    nowIso(),
  ) as { count: number }

  return {
    activeSessions: Number(activeSessions.count || 0),
  }
}

export function getUserById(userId: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRow | undefined
  return row ? toUser(row) : null
}

export function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  if (!validateEmail(normalizedEmail)) {
    return null
  }

  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as UserRow | undefined
  return row ? toUser(row) : null
}

export function listUsersForAdmin(limit = 500): AdminUserListItem[] {
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 500)))
  const database = getDb()
  const timestamp = nowIso()
  const rows = database
    .prepare(
      `
        SELECT *
        FROM users
        ORDER BY datetime(created_at) DESC, email ASC
        LIMIT ?
      `,
    )
    .all(safeLimit) as UserRow[]

  return rows.map((row) => {
    const user = toUser(row)
    const activeSessions = database
      .prepare("SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND expires_at > ?")
      .get(user.id, timestamp) as { count: number } | undefined
    const activePluginTokens = database
      .prepare(
        "SELECT COUNT(*) AS count FROM plugin_tokens WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?",
      )
      .get(user.id, timestamp) as { count: number } | undefined

    return {
      ...user,
      psdUsage: getPsdUsageWithDatabase(database, user),
      activeSessions: Number(activeSessions?.count || 0),
      activePluginTokens: Number(activePluginTokens?.count || 0),
      billingUpdatedAt: row.billing_updated_at || null,
    }
  })
}

export function setManualUserPlanByEmail(input: { email: string; plan: ManualPlan }) {
  const normalizedEmail = normalizeEmail(input.email)
  if (!validateEmail(normalizedEmail)) {
    throw authError("사용 가능한 이메일을 입력해주세요.", { email: "사용 가능한 이메일을 입력해주세요." })
  }

  const database = getDb()
  const existing = database.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail) as
    | Pick<UserRow, "id">
    | undefined
  if (!existing) {
    return null
  }

  const timestamp = nowIso()
  const nextStatus = input.plan === "free" ? "free" : "active"
  database.prepare(`
    UPDATE users
    SET plan = ?,
        plan_status = ?,
        billing_provider = ?,
        billing_customer_id = NULL,
        billing_subscription_id = NULL,
        billing_variant_id = NULL,
        billing_portal_url = NULL,
        plan_renews_at = NULL,
        pending_plan = NULL,
        pending_plan_effective_at = NULL,
        billing_updated_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(input.plan, nextStatus, "manual", timestamp, timestamp, existing.id)

  return getUserById(existing.id)
}

export function syncBillingSubscription(input: {
  userId?: string | null
  customerId: string | null
  subscriptionId: string | null
  variantId: string | null
  portalUrl: string | null
  status: string
  plan: PaidPlan | null
  renewsAt: string | null
  provider?: string
}) {
  const database = getDb()
  const timestamp = nowIso()
  const whereSql = input.userId ? "id = ?" : "billing_subscription_id = ?"
  const whereValue = input.userId || input.subscriptionId
  if (!whereValue) {
    return
  }

  const existing = database.prepare(`SELECT * FROM users WHERE ${whereSql}`).get(whereValue) as UserRow | undefined
  if (!existing || isManualBillingOverride(existing)) {
    return
  }

  const status = String(input.status || "inactive").toLowerCase()
  const incomingPlan = input.plan ? normalizePaidPlan(input.plan) : null
  const currentPlan = resolvePendingPlan(existing)
  const currentTier = getPlanTierValue(currentPlan)
  const incomingTier = getPlanTierValue(incomingPlan)
  const renewsAt = input.renewsAt || null
  const renewsAtDate = renewsAt ? new Date(renewsAt) : null
  const hasFutureRenewal =
    renewsAtDate instanceof Date && !Number.isNaN(renewsAtDate.getTime()) && renewsAtDate.getTime() > Date.now()

  let nextPlan = incomingPlan && paidPlanStatuses.has(status) ? incomingPlan : "free"
  let pendingPlan: string | null = null
  let pendingPlanEffectiveAt: string | null = null

  if (incomingPlan && paidPlanStatuses.has(status) && currentTier > incomingTier && hasFutureRenewal) {
    nextPlan = normalizePlanId(currentPlan)
    pendingPlan = incomingPlan
    pendingPlanEffectiveAt = renewsAt
  } else if (paymentGraceStatuses.has(status) && currentTier > 0) {
    nextPlan = normalizePlanId(currentPlan)
    pendingPlan = "free"
    pendingPlanEffectiveAt = addDaysIso(new Date(), PAYMENT_GRACE_DAYS)
  } else if (immediateRevokeStatuses.has(status)) {
    nextPlan = "free"
  }

  database.prepare(`
    UPDATE users
    SET plan = ?,
        billing_provider = ?,
        billing_customer_id = ?,
        billing_subscription_id = ?,
        billing_variant_id = ?,
        billing_portal_url = ?,
        plan_status = ?,
        plan_renews_at = ?,
        pending_plan = ?,
        pending_plan_effective_at = ?,
        billing_updated_at = ?,
        updated_at = ?
    WHERE ${whereSql}
  `).run(
    nextPlan,
    input.provider || "paddle",
    input.customerId,
    input.subscriptionId,
    input.variantId,
    input.portalUrl,
    status,
    renewsAt,
    pendingPlan,
    pendingPlanEffectiveAt,
    timestamp,
    timestamp,
    whereValue,
  )
}
