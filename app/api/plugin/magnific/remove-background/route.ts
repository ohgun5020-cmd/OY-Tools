import { NextResponse } from "next/server"

import {
  corsHeaders,
  fetchGeneratedImage,
  getMagnificApiKey,
  requirePluginAuth,
  storeTempImage,
} from "@/lib/magnific-plugin"
import { getAppUrl } from "@/lib/app-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RemoveBackgroundRequest = {
  imageBase64?: unknown
  mimeType?: unknown
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

  const body = (await request.json().catch(() => null)) as RemoveBackgroundRequest | null
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
      { error: "A JPG or PNG image under 20 MB is required.", code: "missing_image" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const imageUrl = `${getAppUrl(request)}/api/plugin/magnific/source/${encodeURIComponent(imageId)}`
  const form = new URLSearchParams({ image_url: imageUrl })
  const response = await fetch("https://api.magnific.com/v1/ai/beta/remove-background", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-magnific-api-key": apiKey,
    },
    body: form.toString(),
  })
  const payload = (await response.json().catch(() => null)) as { url?: string; high_resolution?: string } | null

  if (!response.ok || !payload) {
    const detail =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message || "")
        : ""

    return NextResponse.json(
      {
        error: detail || "Magnific background removal failed.",
        code: "magnific_request_failed",
        detail: payload,
        imageUrl,
      },
      { status: 502, headers: corsHeaders() },
    )
  }

  const resultUrl = payload.url || payload.high_resolution
  if (!resultUrl) {
    return NextResponse.json(
      { error: "Magnific did not return a result URL.", code: "missing_result_url", detail: payload },
      { status: 502, headers: corsHeaders() },
    )
  }

  try {
    const image = await fetchGeneratedImage(resultUrl)
    return NextResponse.json(
      {
        ok: true,
        result: payload,
        ...image,
        mimeType: "image/png",
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to download the cutout image.",
        code: "result_download_failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        result: payload,
      },
      { status: 502, headers: corsHeaders() },
    )
  }
}
