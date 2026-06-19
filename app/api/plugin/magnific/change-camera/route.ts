import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/app-url"
import {
  corsHeaders,
  fetchMagnific,
  getMagnificApiKey,
  readMagnificJson,
  requirePluginAuth,
  storeTempImage,
} from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ChangeCameraRequest = {
  imageBase64?: unknown
  mimeType?: unknown
  horizontalAngle?: unknown
  horizontal_angle?: unknown
  verticalAngle?: unknown
  vertical_angle?: unknown
  zoom?: unknown
  outputFormat?: unknown
  output_format?: unknown
  apiKey?: unknown
  magnificApiKey?: unknown
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) {
    return fallback
  }
  return Math.max(min, Math.min(max, Math.round(numberValue)))
}

function normalizeOutputFormat(value: unknown) {
  return value === "jpeg" ? "jpeg" : "png"
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function POST(request: Request) {
  const auth = requirePluginAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const body = (await request.json().catch(() => null)) as ChangeCameraRequest | null
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

  const imageId = storeTempImage({ imageBase64: body.imageBase64, mimeType: body.mimeType })
  if (!imageId) {
    return NextResponse.json(
      { error: "A JPG, PNG, or WebP image under 20 MB is required.", code: "missing_image" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const imageUrl = `${getAppUrl(request)}/api/plugin/magnific/source/${encodeURIComponent(imageId)}`
  const magnificResponse = await fetchMagnific("/v1/ai/image-change-camera", apiKey, {
    method: "POST",
    body: JSON.stringify({
      image: imageUrl,
      horizontal_angle: clampInteger(body.horizontalAngle ?? body.horizontal_angle, 45, 0, 360),
      vertical_angle: clampInteger(body.verticalAngle ?? body.vertical_angle, 0, -30, 90),
      zoom: clampInteger(body.zoom, 5, 0, 10),
      output_format: normalizeOutputFormat(body.outputFormat ?? body.output_format),
    }),
  })
  const payload = await readMagnificJson(magnificResponse)

  if (!magnificResponse.ok) {
    return NextResponse.json(
      {
        error: "Magnific change camera request failed.",
        code: "magnific_request_failed",
        detail: payload,
        imageUrl,
      },
      { status: 502, headers: corsHeaders() },
    )
  }

  return NextResponse.json({ ok: true, task: payload?.data }, { headers: corsHeaders() })
}
