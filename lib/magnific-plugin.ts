import { getAppUrl } from "@/lib/app-url"
import { getUserByPluginAccessToken, type AuthUser } from "@/lib/auth"
import { getPlanEntitlement } from "@/lib/plan-entitlements"

export const MAGNIFIC_API_BASE = "https://api.magnific.com"

export type MagnificAuthResult =
  | { ok: true; user: AuthUser | null; entitlement: ReturnType<typeof getPlanEntitlement> | null }
  | { ok: false; response: Response }

export type MagnificTaskData = {
  task_id?: string
  status?: string
  generated?: string[]
}

export type MagnificTaskResponse = {
  data?: MagnificTaskData
  [key: string]: unknown
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Magnific-API-Key",
    "Cache-Control": "no-store",
  }
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ""
}

export function cleanSecret(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }
  return value.replace(/^Bearer\s+/i, "").trim()
}

export function getMagnificApiKey(request: Request, body?: { apiKey?: unknown; magnificApiKey?: unknown }) {
  return (
    cleanSecret(request.headers.get("x-magnific-api-key")) ||
    cleanSecret(body?.magnificApiKey) ||
    cleanSecret(body?.apiKey) ||
    cleanSecret(process.env.MAGNIFIC_API_KEY)
  )
}

export function getMonthlyCreditLimit() {
  return parseCreditEnv(process.env.MAGNIFIC_MONTHLY_CREDIT_LIMIT)
}

export function getMonthlyCreditUsedFallback() {
  return parseCreditEnv(process.env.MAGNIFIC_USED_CREDITS_THIS_MONTH)
}

function parseCreditEnv(raw: unknown) {
  if (typeof raw !== "string" || !raw.trim()) {
    return null
  }

  const value = raw
    .trim()
    .replace(/^:+/, "")
    .replace(/^["']|["']$/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
  const multiplier = value.endsWith("k") ? 1000 : 1
  const withoutSuffix = value.replace(/k$/, "")
  const normalized =
    multiplier === 1000
      ? withoutSuffix.replace(",", ".")
      : withoutSuffix.replace(/,/g, "")
  const parsed = Number(normalized)

  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * multiplier) : null
}

export function getPrecisionCreditsPerMegapixel() {
  const value = Number(process.env.MAGNIFIC_PRECISION_V2_CREDITS_PER_MEGAPIXEL || 1)
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function estimatePrecisionCredits(width: unknown, height: unknown, scaleFactor: unknown) {
  const sourceWidth = Number(width)
  const sourceHeight = Number(height)
  const scale = Number(scaleFactor)
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || !Number.isFinite(scale)) {
    return null
  }
  if (sourceWidth <= 0 || sourceHeight <= 0 || scale < 2) {
    return null
  }

  const outputMegapixels = (sourceWidth * scale * sourceHeight * scale) / 1_000_000
  return Math.max(1, Math.ceil(outputMegapixels * getPrecisionCreditsPerMegapixel()))
}

export function webLinks(request: Request) {
  const appUrl = getAppUrl(request)
  return {
    connect: `${appUrl}/plugin/connect`,
    dashboard: `${appUrl}/dashboard`,
    billing: `${appUrl}/dashboard#billing`,
    pricing: `${appUrl}/#pricing`,
  }
}

export function requirePluginAuth(request: Request): MagnificAuthResult {
  const token = getBearerToken(request)
  const user = token ? getUserByPluginAccessToken(token) : null
  const requiresToken = process.env.MAGNIFIC_PLUGIN_REQUIRE_TOKEN === "true"
  const requiresPro = process.env.MAGNIFIC_PLUGIN_REQUIRE_PRO === "true"

  if (!user) {
    if (!requiresToken) {
      return { ok: true, user: null, entitlement: null }
    }

    return {
      ok: false,
      response: Response.json(
        { error: "Plugin authentication is required.", code: "plugin_auth_required", links: webLinks(request) },
        { status: 401, headers: corsHeaders() },
      ),
    }
  }

  const entitlement = getPlanEntitlement(user)
  if (requiresPro && !entitlement.serverAiEnabled) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Magnific image tools are available on the Pro plan.",
          code: "ai_plan_required",
          requiredPlan: "pro",
          user: {
            plan: user.plan,
            planStatus: user.planStatus,
            entitlement,
          },
          links: webLinks(request),
        },
        { status: 403, headers: corsHeaders() },
      ),
    }
  }

  return { ok: true, user, entitlement }
}

export async function fetchMagnific(path: string, apiKey: string, init?: RequestInit) {
  return fetch(`${MAGNIFIC_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      "x-magnific-api-key": apiKey,
    },
  })
}

export async function readMagnificJson(response: Response) {
  return (await response.json().catch(() => null)) as MagnificTaskResponse | null
}

export function taskHasImage(task: MagnificTaskResponse | null) {
  return Boolean(task?.data?.generated?.[0])
}

export async function fetchGeneratedImage(generatedUrl: string) {
  const response = await fetch(generatedUrl, { headers: { Accept: "image/png,image/jpeg,image/webp,*/*" } })
  if (!response.ok) {
    throw new Error(`Generated image fetch failed with HTTP ${response.status}.`)
  }

  const contentType = response.headers.get("content-type") || "image/png"
  const bytes = Buffer.from(await response.arrayBuffer())
  return {
    mimeType: contentType.split(";")[0] || "image/png",
    imageBase64: bytes.toString("base64"),
  }
}

export function normalizeScaleFactor(value: unknown) {
  const scale = Number(value)
  if (!Number.isFinite(scale)) {
    return 2
  }
  return Math.max(2, Math.min(16, Math.floor(scale)))
}

export function normalizePrecisionFlavor(value: unknown) {
  const flavor = typeof value === "string" ? value : "photo"
  return flavor === "sublime" || flavor === "photo_denoiser" || flavor === "photo" ? flavor : "photo"
}

export function normalizeAspectRatio(value: unknown) {
  const ratio = typeof value === "string" ? value : "square_1_1"
  const supported = new Set([
    "square_1_1",
    "widescreen_16_9",
    "social_story_9_16",
    "portrait_2_3",
    "traditional_3_4",
    "standard_3_2",
    "classic_4_3",
    "cinematic_21_9",
  ])
  return supported.has(ratio) ? ratio : "square_1_1"
}
