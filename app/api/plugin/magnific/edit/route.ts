import { NextResponse } from "next/server"

import {
  corsHeaders,
  fetchMagnific,
  getMagnificApiKey,
  normalizeAspectRatio,
  readMagnificJson,
  requirePluginAuth,
} from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EditRequest = {
  imageBase64?: unknown
  image?: unknown
  prompt?: unknown
  aspectRatio?: unknown
  apiKey?: unknown
  magnificApiKey?: unknown
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function POST(request: Request) {
  const auth = requirePluginAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const body = (await request.json().catch(() => null)) as EditRequest | null
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

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
  const image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : cleanImageBase64(body.imageBase64)
  if (!prompt || !image) {
    return NextResponse.json(
      { error: "Prompt and exported image are required.", code: "missing_edit_input" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const magnificResponse = await fetchMagnific("/v1/ai/text-to-image/seedream-v4-5-edit", apiKey, {
    method: "POST",
    body: JSON.stringify({
      prompt,
      reference_images: [image],
      aspect_ratio: normalizeAspectRatio(body.aspectRatio),
      enable_safety_checker: true,
    }),
  })
  const payload = await readMagnificJson(magnificResponse)

  if (!magnificResponse.ok) {
    return NextResponse.json(
      { error: "Magnific edit request failed.", code: "magnific_request_failed", detail: payload },
      { status: 502, headers: corsHeaders() },
    )
  }

  return NextResponse.json({ ok: true, task: payload?.data }, { headers: corsHeaders() })
}

function cleanImageBase64(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").trim()
}
