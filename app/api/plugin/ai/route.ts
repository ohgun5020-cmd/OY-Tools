import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import { getUserByPluginAccessToken } from "@/lib/auth"
import { getPlanEntitlement } from "@/lib/plan-entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
const DEFAULT_MAX_OUTPUT_TOKENS = 1200
const HARD_MAX_OUTPUT_TOKENS = 4000

type PluginAiRequest = {
  prompt?: unknown
  input?: unknown
  instructions?: unknown
  model?: unknown
  temperature?: unknown
  maxOutputTokens?: unknown
  max_output_tokens?: unknown
  apiKey?: unknown
  openaiApiKey?: unknown
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-OpenAI-API-Key, X-Pigma-OpenAI-Key, X-User-OpenAI-Key",
    "Cache-Control": "no-store",
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ""
}

function cleanApiKey(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return value.replace(/^Bearer\s+/i, "").trim()
}

function getUserOpenAiKey(request: Request, body: PluginAiRequest) {
  return (
    cleanApiKey(request.headers.get("x-pigma-openai-key")) ||
    cleanApiKey(request.headers.get("x-openai-api-key")) ||
    cleanApiKey(request.headers.get("x-user-openai-key")) ||
    cleanApiKey(body.openaiApiKey) ||
    cleanApiKey(body.apiKey)
  )
}

function getServerOpenAiKey() {
  return cleanApiKey(process.env.OPENAI_API_KEY)
}

function getDefaultModel() {
  return String(process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL
}

function getMaxOutputTokens(value: unknown) {
  const configuredMax = Number(process.env.PIGMA_AI_MAX_OUTPUT_TOKENS || DEFAULT_MAX_OUTPUT_TOKENS)
  const maximum = Number.isFinite(configuredMax) && configuredMax > 0
    ? Math.min(Math.floor(configuredMax), HARD_MAX_OUTPUT_TOKENS)
    : DEFAULT_MAX_OUTPUT_TOKENS

  const requested = Number(value)
  if (!Number.isFinite(requested) || requested <= 0) {
    return maximum
  }

  return Math.min(Math.floor(requested), maximum)
}

function getTemperature(value: unknown) {
  if (value === undefined || value === null) {
    return undefined
  }

  const temperature = Number(value)
  if (!Number.isFinite(temperature)) {
    return undefined
  }

  return Math.max(0, Math.min(2, temperature))
}

function getInput(body: PluginAiRequest) {
  const input = body.input ?? body.prompt

  if (typeof input === "string") {
    const text = input.trim()
    return text ? text : null
  }

  if (Array.isArray(input)) {
    return input
  }

  return null
}

function getInstructions(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function getClientModel(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function getOutputText(response: unknown) {
  if (!response || typeof response !== "object") {
    return ""
  }

  const payload = response as {
    output_text?: unknown
    output?: Array<{
      content?: Array<{
        text?: unknown
        type?: unknown
      }>
    }>
  }

  if (typeof payload.output_text === "string") {
    return payload.output_text
  }

  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => (typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n")
}

function webLinks(request: Request) {
  const appUrl = getAppUrl(request)
  return {
    dashboard: `${appUrl}/dashboard`,
    billing: `${appUrl}/dashboard#billing`,
    pricing: `${appUrl}/#pricing`,
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function POST(request: Request) {
  const user = getUserByPluginAccessToken(getBearerToken(request))
  if (!user) {
    return NextResponse.json(
      { error: "Plugin authentication is required.", code: "plugin_auth_required", links: webLinks(request) },
      { status: 401, headers: corsHeaders() },
    )
  }

  const body = (await request.json().catch(() => null)) as PluginAiRequest | null
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid AI request body.", code: "invalid_request" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const input = getInput(body)
  if (!input) {
    return NextResponse.json(
      { error: "AI request requires a prompt or input.", code: "missing_input" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const entitlement = getPlanEntitlement(user)
  const userOpenAiKey = getUserOpenAiKey(request, body)
  const usingUserKey = Boolean(userOpenAiKey)

  if (!usingUserKey && !entitlement.serverAiEnabled) {
    return NextResponse.json(
      {
        error: "Server AI is available on the Pro plan.",
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
    )
  }

  const apiKey = userOpenAiKey || getServerOpenAiKey()
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server AI is not configured.", code: "server_ai_unconfigured" },
      { status: 503, headers: corsHeaders() },
    )
  }

  const model =
    usingUserKey || process.env.PIGMA_AI_ALLOW_CLIENT_MODEL === "true"
      ? getClientModel(body.model) || getDefaultModel()
      : getDefaultModel()
  const requestBody: Record<string, unknown> = {
    model,
    input,
    max_output_tokens: getMaxOutputTokens(body.maxOutputTokens ?? body.max_output_tokens),
  }
  const instructions = getInstructions(body.instructions)
  const temperature = getTemperature(body.temperature)

  if (instructions) {
    requestBody.instructions = instructions
  }

  if (temperature !== undefined) {
    requestBody.temperature = temperature
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
  const payload = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? (payload as { error?: { message?: string } }).error?.message
        : null

    return NextResponse.json(
      {
        error: "OpenAI request failed.",
        code: "openai_request_failed",
        detail: message || `OpenAI returned HTTP ${response.status}.`,
      },
      { status: 502, headers: corsHeaders() },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      provider: usingUserKey ? "user" : "server",
      model,
      text: getOutputText(payload),
      response: payload,
      user: {
        plan: user.plan,
        planStatus: user.planStatus,
        entitlement,
      },
    },
    { headers: corsHeaders() },
  )
}
