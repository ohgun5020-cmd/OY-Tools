import { NextResponse } from "next/server"

import {
  cleanImageBase64,
  corsHeaders,
  estimatePrecisionCredits,
  fetchMagnific,
  getMagnificApiKey,
  getMagnificUpscaleModel,
  normalizePrecisionFlavor,
  normalizeScaleFactor,
  readMagnificJson,
  requirePluginAuth,
} from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UpscaleRequest = {
  imageBase64?: unknown
  image?: unknown
  mimeType?: unknown
  scaleFactor?: unknown
  flavor?: unknown
  model?: unknown
  width?: unknown
  height?: unknown
  sharpen?: unknown
  smartGrain?: unknown
  ultraDetail?: unknown
  apiKey?: unknown
  magnificApiKey?: unknown
}

function clampControl(value: unknown, fallback: number) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) {
    return fallback
  }
  return Math.max(0, Math.min(100, Math.floor(numberValue)))
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function POST(request: Request) {
  const auth = requirePluginAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const body = (await request.json().catch(() => null)) as UpscaleRequest | null
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body.", code: "invalid_request" }, { status: 400, headers: corsHeaders() })
  }

  const apiKey = getMagnificApiKey(request, body)
  if (!apiKey) {
    return NextResponse.json(
      { error: "Magnific API key is not configured.", code: "magnific_key_required" },
      { status: 503, headers: corsHeaders() },
    )
  }

  const image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : cleanImageBase64(body.imageBase64)
  if (!image) {
    return NextResponse.json(
      { error: "An exported image is required.", code: "missing_image" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const scaleFactor = normalizeScaleFactor(body.scaleFactor)
  const model = getMagnificUpscaleModel(body.model)
  const requestBody: Record<string, unknown> = {
    image,
    filter_nsfw: false,
  }

  if (model.provider === "precision-v2") {
    requestBody.scale_factor = scaleFactor
    requestBody.flavor = normalizePrecisionFlavor(body.flavor)
    requestBody.sharpen = clampControl(body.sharpen, 7)
    requestBody.smart_grain = clampControl(body.smartGrain, 7)
    requestBody.ultra_detail = clampControl(body.ultraDetail, 30)
  } else if (model.provider === "precision-v1") {
    requestBody.sharpen = clampControl(body.sharpen, 50)
    requestBody.smart_grain = clampControl(body.smartGrain, 7)
    requestBody.ultra_detail = clampControl(body.ultraDetail, 30)
  } else {
    requestBody.scale_factor = `${scaleFactor}x`
    requestBody.optimized_for = body.flavor === "sublime" ? "art_n_illustration" : "standard"
    requestBody.prompt = "High quality upscale, preserve the original image, improve detail and clarity."
    requestBody.creativity = 0
    requestBody.hdr = 0
    requestBody.resemblance = 2
    requestBody.fractality = 0
    requestBody.engine = "automatic"
  }

  const magnificResponse = await fetchMagnific(model.endpoint, apiKey, {
    method: "POST",
    body: JSON.stringify(requestBody),
  })
  const payload = await readMagnificJson(magnificResponse)

  if (!magnificResponse.ok) {
    return NextResponse.json(
      {
        error: "Magnific upscale request failed.",
        code: "magnific_request_failed",
        detail: payload,
      },
      { status: 502, headers: corsHeaders() },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      model,
      task: payload?.data,
      estimatedCredits: estimatePrecisionCredits(body.width, body.height, scaleFactor),
      user: {
        plan: auth.user?.plan || null,
        planStatus: auth.user?.planStatus || null,
        entitlement: auth.entitlement,
      },
    },
    { headers: corsHeaders() },
  )
}
