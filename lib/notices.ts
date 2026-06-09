import { createHash, createHmac } from "node:crypto"

export type NoticeType = "release" | "update" | "notice" | "maintenance"
export type NoticeSeverity = "info" | "success" | "warning" | "critical"

export type NoticeLocaleContent = {
  title: string
  body: string
  bullets: string[]
}

export type NoticeItem = {
  id: string
  type: NoticeType
  severity: NoticeSeverity
  title: string
  body: string
  bullets: string[]
  publishedAt: string
  visible: boolean
  url?: string
  cta?: string
  locales?: Record<string, Partial<NoticeLocaleContent>>
}

export type NoticeVersionInfo = {
  latest: string
  minimumSupported: string
  channel: string
  message: string
  communityUrl: string
}

export type NoticePayload = {
  schemaVersion: 1
  updatedAt: string
  defaultLocale: string
  version: NoticeVersionInfo
  items: NoticeItem[]
}

type R2UploadConfig = {
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  objectKey: string
}

const fallbackNoticeUrl = "https://pub-8e2f2ec9d22c4c97b52fe244b86bc4cf.r2.dev/notices/pigma-notices.json"
const fallbackObjectKey = "notices/pigma-notices.json"
const fallbackBucket = "pigma-assets"
const maxNoticeBytes = 64 * 1024
const noticeTypes = new Set<NoticeType>(["release", "update", "notice", "maintenance"])
const noticeSeverities = new Set<NoticeSeverity>(["info", "success", "warning", "critical"])

function cleanText(value: unknown, maxLength = 600) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

function cleanMultiline(value: unknown, maxLength = 900) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
    .trim()
    .slice(0, maxLength)
}

function cleanId(value: unknown) {
  const raw = cleanText(value, 80).toLowerCase()
  return raw.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || `notice-${Date.now()}`
}

function cleanDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function cleanHttpsUrl(value: unknown) {
  const raw = cleanText(value, 500)
  if (!raw) {
    return ""
  }
  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString() : ""
  } catch {
    return ""
  }
}

function cleanVersion(value: unknown) {
  return cleanText(value, 32)
    .replace(/^v/i, "")
    .replace(/[^0-9A-Za-z.+_-]/g, "")
    .slice(0, 32)
}

function normalizeVersionInfo(value: unknown): NoticeVersionInfo {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  return {
    latest: cleanVersion(source.latest || "2.8.0") || "2.8.0",
    minimumSupported: cleanVersion(source.minimumSupported || "2.8.0") || "2.8.0",
    channel: cleanText(source.channel || "stable", 24).toLowerCase() || "stable",
    message: cleanText(source.message, 220),
    communityUrl: cleanHttpsUrl(source.communityUrl || source.url),
  }
}

function cleanBullets(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, 160)).filter(Boolean).slice(0, 8)
  }
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => cleanText(item, 160))
    .filter(Boolean)
    .slice(0, 8)
}

function cleanLocales(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  const locales: Record<string, Partial<NoticeLocaleContent>> = {}
  for (const [locale, content] of Object.entries(value as Record<string, unknown>)) {
    const localeKey = cleanText(locale, 16).toLowerCase().replace(/[^a-z0-9-]/g, "")
    if (!localeKey || !content || typeof content !== "object" || Array.isArray(content)) {
      continue
    }
    const source = content as Record<string, unknown>
    const title = cleanText(source.title, 140)
    const body = cleanMultiline(source.body, 900)
    const bullets = cleanBullets(source.bullets)
    if (!title && !body && !bullets.length) {
      continue
    }
    locales[localeKey] = { title, body, bullets }
  }

  return Object.keys(locales).length ? locales : undefined
}

function uniqueNoticeId(id: string, seenIds: Set<string>) {
  const base = cleanId(id)
  let next = base
  let suffix = 2
  while (seenIds.has(next)) {
    next = `${base}-${suffix}`
    suffix += 1
  }
  seenIds.add(next)
  return next
}

export function getNoticePublicUrl() {
  return process.env.PIGMA_NOTICE_PUBLIC_URL || process.env.NEXT_PUBLIC_PIGMA_NOTICE_URL || fallbackNoticeUrl
}

export function getNoticeObjectKey() {
  return process.env.PIGMA_NOTICE_OBJECT_KEY || fallbackObjectKey
}

export function createEmptyNoticePayload(): NoticePayload {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    defaultLocale: "en",
    version: normalizeVersionInfo({}),
    items: [],
  }
}

export function normalizeNoticePayload(value: unknown): NoticePayload {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const items = Array.isArray(source.items) ? source.items : []
  const seenIds = new Set<string>()
  return {
    schemaVersion: 1,
    updatedAt: cleanDate(source.updatedAt),
    defaultLocale: cleanText(source.defaultLocale || "en", 16).toLowerCase() || "en",
    version: normalizeVersionInfo(source.version),
    items: items
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((item) => {
        const sourceItem = item as Record<string, unknown>
        const type = cleanText(sourceItem.type, 20).toLowerCase() as NoticeType
        const severity = cleanText(sourceItem.severity, 20).toLowerCase() as NoticeSeverity
        const normalized: NoticeItem = {
          id: cleanId(sourceItem.id),
          type: noticeTypes.has(type) ? type : "release",
          severity: noticeSeverities.has(severity) ? severity : "info",
          title: cleanText(sourceItem.title, 140),
          body: cleanMultiline(sourceItem.body, 900),
          bullets: cleanBullets(sourceItem.bullets || sourceItem.points),
          publishedAt: cleanDate(sourceItem.publishedAt || sourceItem.updatedAt),
          visible: sourceItem.visible !== false,
        }
        const url = cleanHttpsUrl(sourceItem.url)
        const cta = cleanText(sourceItem.cta, 48)
        const locales = cleanLocales(sourceItem.locales)
        if (url) {
          normalized.url = url
        }
        if (cta) {
          normalized.cta = cta
        }
        if (locales) {
          normalized.locales = locales
        }
        normalized.id = uniqueNoticeId(normalized.id, seenIds)
        return normalized
      })
      .filter((item) => item.title || item.body || item.bullets.length || item.locales)
      .slice(0, 24),
  }
}

export async function readNoticePayload(): Promise<NoticePayload> {
  const response = await fetch(getNoticePublicUrl(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  }).catch(() => null)
  if (!response || !response.ok) {
    return createEmptyNoticePayload()
  }

  const text = await response.text()
  if (text.length > maxNoticeBytes) {
    return createEmptyNoticePayload()
  }

  try {
    return normalizeNoticePayload(JSON.parse(text))
  } catch {
    return createEmptyNoticePayload()
  }
}

function getR2Config(): R2UploadConfig {
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    process.env.AWS_ENDPOINT_URL_S3 ||
    ""
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || process.env.R2_BUCKET || process.env.AWS_S3_BUCKET || fallbackBucket
  const accessKeyId =
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    ""
  const secretAccessKey =
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    ""

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 notice upload is not configured.")
  }

  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    bucket,
    accessKeyId,
    secretAccessKey,
    objectKey: getNoticeObjectKey(),
  }
}

function hashHex(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex")
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest()
}

function encodeS3Path(value: string) {
  return value
    .split("/")
    .map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/")
}

export async function uploadNoticePayload(input: unknown) {
  const payload = normalizeNoticePayload({
    ...(input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {}),
    updatedAt: new Date().toISOString(),
  })
  const bytes = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8")
  if (bytes.byteLength > maxNoticeBytes) {
    throw new Error("Notice JSON is too large.")
  }

  const config = getR2Config()
  const endpointUrl = new URL(config.endpoint)
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  const dateStamp = amzDate.slice(0, 8)
  const region = "auto"
  const service = "s3"
  const canonicalUri = `/${encodeS3Path(config.bucket)}/${encodeS3Path(config.objectKey)}`
  const targetUrl = `${config.endpoint}${canonicalUri}`
  const payloadHash = hashHex(bytes)
  const headers: Record<string, string> = {
    "cache-control": "public, max-age=60",
    "content-type": "application/json; charset=utf-8",
    host: endpointUrl.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  }
  const signedHeaders = Object.keys(headers).sort().join(";")
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("")
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n")
  const algorithm = "AWS4-HMAC-SHA256"
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [algorithm, amzDate, credentialScope, hashHex(canonicalRequest)].join("\n")
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), region), service), "aws4_request")
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex")
  const authorization = `${algorithm} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(targetUrl, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Cache-Control": headers["cache-control"],
      "Content-Type": headers["content-type"],
      "x-amz-content-sha256": headers["x-amz-content-sha256"],
      "x-amz-date": headers["x-amz-date"],
    },
    body: bytes,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`R2 notice upload failed with ${response.status}. ${body.slice(0, 240)}`)
  }

  return payload
}
