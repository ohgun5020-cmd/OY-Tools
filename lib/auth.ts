import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto"
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

import { cookies } from "next/headers"

const SESSION_COOKIE = "pigma_session"
const PASSWORD_PREFIX = "scrypt"
const SESSION_HOURS = 8
const REMEMBER_SESSION_DAYS = 30
const paidPlanStatuses = new Set(["active", "on_trial"])

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
    CREATE INDEX IF NOT EXISTS users_billing_customer_id_idx ON users(billing_customer_id);
    CREATE INDEX IF NOT EXISTS users_billing_subscription_id_idx ON users(billing_subscription_id);
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
  ensureColumn(database, "users", "billing_updated_at", "ALTER TABLE users ADD COLUMN billing_updated_at TEXT")
  ensureColumn(database, "users", "updated_at", "ALTER TABLE users ADD COLUMN updated_at TEXT")
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
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    plan: row.plan,
    provider: row.provider,
    avatarUrl: row.avatar_url,
    billingProvider: row.billing_provider,
    billingCustomerId: row.billing_customer_id,
    billingSubscriptionId: row.billing_subscription_id,
    billingVariantId: row.billing_variant_id,
    billingPortalUrl: row.billing_portal_url,
    planStatus: row.plan_status,
    planRenewsAt: row.plan_renews_at,
    createdAt: row.created_at,
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
  const timestamp = nowIso()

  if (existingByGoogle) {
    database.prepare("UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?").run(
      normalizeName(profile.name || existingByGoogle.name),
      profile.picture || existingByGoogle.avatar_url,
      timestamp,
      existingByGoogle.id,
    )
    return existingByGoogle.id
  }

  const existingByEmail = database.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
  if (existingByEmail) {
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

export function syncBillingSubscription(input: {
  userId?: string | null
  customerId: string | null
  subscriptionId: string | null
  variantId: string | null
  portalUrl: string | null
  status: string
  plan: "basic" | "pro" | null
  renewsAt: string | null
}) {
  const nextPlan = input.plan && paidPlanStatuses.has(input.status) ? input.plan : "free"
  const timestamp = nowIso()
  const whereSql = input.userId ? "id = ?" : "billing_subscription_id = ?"
  const whereValue = input.userId || input.subscriptionId

  getDb().prepare(`
    UPDATE users
    SET plan = ?,
        billing_provider = 'lemonsqueezy',
        billing_customer_id = ?,
        billing_subscription_id = ?,
        billing_variant_id = ?,
        billing_portal_url = ?,
        plan_status = ?,
        plan_renews_at = ?,
        billing_updated_at = ?,
        updated_at = ?
    WHERE ${whereSql}
  `).run(
    nextPlan,
    input.customerId,
    input.subscriptionId,
    input.variantId,
    input.portalUrl,
    input.status,
    input.renewsAt,
    timestamp,
    timestamp,
    whereValue,
  )
}
